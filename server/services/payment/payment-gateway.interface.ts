export interface PaymentGatewayConfig {
  apiKey?: string;
  merchantId?: string;
  sandbox?: boolean;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  metadata?: unknown;
}

export interface PaymentRequest {
  amount: number; // in cents
  currency: string;
  orderId: number;
  metadata?: Record<string, unknown>;
}

export interface IPaymentGateway {
  initialize(config: PaymentGatewayConfig): Promise<void>;
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
  validateWebhook?(payload: unknown, signature: string): Promise<boolean>;
}
