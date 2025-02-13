import { PaymentGateway, Transaction } from '@shared/schema';
import { IPaymentGateway, PaymentRequest } from './payment-gateway.interface';
import { StripeGateway } from './stripe-gateway';
import { storage } from '../../storage';
import { sendEmail } from '../email/email-service';

export class PaymentService {
  private stripeGateway: StripeGateway;

  constructor() {
    this.stripeGateway = new StripeGateway();
  }

  async initializeGateways(): Promise<void> {
    const gateways = await storage.getPaymentGateways();
    const stripeGateway = gateways.find(g => g.type === 'stripe' && g.enabled);

    if (stripeGateway) {
      await this.stripeGateway.initialize(stripeGateway.config || {});
    }
  }

  async processPayment(
    request: PaymentRequest
  ): Promise<Transaction> {
    // Get the default Stripe gateway
    const gateway = await this.getDefaultGateway();

    const result = await this.stripeGateway.processPayment(request);

    // Create transaction record
    const transaction = await storage.createTransaction({
      orderId: request.orderId,
      amount: request.amount,
      paymentMethod: 'stripe',
      gatewayId: gateway.id,
      gatewayTransactionId: result.transactionId || null,
      status: result.success ? 'completed' : 'failed',
      metadata: {
        error: result.error,
        gatewayResponse: result.metadata,
      },
    });

    // Update order payment status if successful
    if (result.success) {
      await storage.updateOrderPaymentStatus(request.orderId, 'paid');

      // Send payment confirmation email
      const order = await storage.getOrder(request.orderId);
      if (order) {
        await this.sendPaymentConfirmation(order, transaction);
      }
    }

    return transaction;
  }

  private async getDefaultGateway(): Promise<PaymentGateway> {
    const gateways = await storage.getPaymentGateways();
    const stripeGateway = gateways.find(g => g.type === 'stripe' && g.enabled);

    if (!stripeGateway) {
      throw new Error('No active Stripe payment gateway found');
    }

    return stripeGateway;
  }

  private async sendPaymentConfirmation(order: any, transaction: Transaction) {
    const amount = (transaction.amount / 100).toFixed(2);
    const html = `
      <h2>Payment Confirmation</h2>
      <p>Thank you for your payment!</p>
      <p>Order #${order.id}</p>
      <p>Amount: $${amount}</p>
      <p>Transaction ID: ${transaction.gatewayTransactionId}</p>
    `;

    await sendEmail({
      to: 'customer@example.com', // In real app, this would be the customer's email
      from: 'noreply@restaurant.com',
      subject: `Payment Confirmation - Order #${order.id}`,
      html,
    });
  }
}

export const paymentService = new PaymentService();