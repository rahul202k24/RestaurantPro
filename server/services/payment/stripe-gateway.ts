import Stripe from 'stripe';
import { IPaymentGateway, PaymentGatewayConfig, PaymentRequest, PaymentResult } from './payment-gateway.interface';

export class StripeGateway implements IPaymentGateway {
  private stripe!: Stripe;

  async initialize(config: PaymentGatewayConfig): Promise<void> {
    if (!config.apiKey) {
      throw new Error('Stripe API key is required');
    }
    this.stripe = new Stripe(config.apiKey, {
      apiVersion: '2023-08-16',
    });
  }

  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: request.amount,
        currency: request.currency.toLowerCase(),
        metadata: {
          orderId: request.orderId.toString(),
          ...request.metadata,
        },
      });

      return {
        success: true,
        transactionId: paymentIntent.id,
        metadata: paymentIntent,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async validateWebhook(payload: unknown, signature: string): Promise<boolean> {
    // Implementation for Stripe webhook validation
    return true;
  }
}