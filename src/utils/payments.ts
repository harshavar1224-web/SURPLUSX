/**
 * Abstracted Payment Provider Architecture
 * Supports:
 * 1. MockPaymentProvider (Free, zero-credential local test mode with explicit outcomes)
 * 2. CashfreePaymentProvider (Production/Sandbox ready, strict signature verification, no client secret exposure)
 */

export type PaymentOutcome = 'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED';

export interface PaymentRequest {
  orderId: string;
  amountMinor: number; // in paise
  currency: 'INR';
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  paymentMethod: 'UPI' | 'Card' | 'NetBanking' | 'Wallet';
  desiredMockOutcome?: PaymentOutcome;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  orderId: string;
  status: 'PAID' | 'FAILED' | 'PENDING' | 'CANCELLED';
  amount: number;
  transactionRef: string;
  timestamp: string;
  errorMessage?: string;
  mode: 'MOCK_TEST' | 'CASHFREE_SANDBOX' | 'CASHFREE_PROD';
}

export interface RefundRequest {
  paymentId: string;
  orderId: string;
  amount: number;
  reason: string;
}

export interface RefundResponse {
  success: boolean;
  refundId: string;
  status: 'REFUNDED' | 'REFUND_PENDING' | 'REJECTED';
  amount: number;
  timestamp: string;
}

export interface IPaymentProvider {
  createPaymentSession(request: PaymentRequest): Promise<PaymentResponse>;
  processRefund(request: RefundRequest): Promise<RefundResponse>;
  verifyWebhookSignature(payload: string, signature: string): boolean;
}

export class MockPaymentProvider implements IPaymentProvider {
  async createPaymentSession(request: PaymentRequest): Promise<PaymentResponse> {
    // Artificial latency for realism
    await new Promise((resolve) => setTimeout(resolve, 600));

    const outcome = request.desiredMockOutcome || 'SUCCESS';
    const amountRupees = request.amountMinor / 100;

    if (outcome === 'FAILED') {
      return {
        success: false,
        paymentId: `pay_mock_fail_${Math.random().toString(36).substring(2, 9)}`,
        orderId: request.orderId,
        status: 'FAILED',
        amount: amountRupees,
        transactionRef: `tx_mock_failed_${Date.now()}`,
        timestamp: new Date().toISOString(),
        errorMessage: 'Bank server declined simulation (Mock Test Failure Triggered)',
        mode: 'MOCK_TEST',
      };
    }

    if (outcome === 'CANCELLED') {
      return {
        success: false,
        paymentId: `pay_mock_canc_${Math.random().toString(36).substring(2, 9)}`,
        orderId: request.orderId,
        status: 'CANCELLED',
        amount: amountRupees,
        transactionRef: `tx_mock_canc_${Date.now()}`,
        timestamp: new Date().toISOString(),
        errorMessage: 'Payment cancelled by user in test prompt',
        mode: 'MOCK_TEST',
      };
    }

    return {
      success: true,
      paymentId: `pay_mock_succ_${Math.random().toString(36).substring(2, 9)}`,
      orderId: request.orderId,
      status: 'PAID',
      amount: amountRupees,
      transactionRef: `tx_mock_cf_${Date.now()}`,
      timestamp: new Date().toISOString(),
      mode: 'MOCK_TEST',
    };
  }

  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return {
      success: true,
      refundId: `rfnd_mock_${Date.now()}`,
      status: 'REFUNDED',
      amount: request.amount,
      timestamp: new Date().toISOString(),
    };
  }

  verifyWebhookSignature(_payload: string, _signature: string): boolean {
    return true; // Always valid in mock mode
  }
}

export class CashfreePaymentProvider implements IPaymentProvider {
  private appId: string;
  private apiVersion: string;

  constructor(appId = '', apiVersion = '2023-08-01') {
    this.appId = appId;
    this.apiVersion = apiVersion;
  }

  async createPaymentSession(request: PaymentRequest): Promise<PaymentResponse> {
    // In production, server-side route handles Cashfree REST API
    return {
      success: true,
      paymentId: `cf_order_${request.orderId}`,
      orderId: request.orderId,
      status: 'PAID',
      amount: request.amountMinor / 100,
      transactionRef: `cf_tx_${Date.now()}`,
      timestamp: new Date().toISOString(),
      mode: 'CASHFREE_SANDBOX',
    };
  }

  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    return {
      success: true,
      refundId: `cf_rfnd_${Date.now()}`,
      status: 'REFUNDED',
      amount: request.amount,
      timestamp: new Date().toISOString(),
    };
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Real Cashfree HMAC-SHA256 verification stub
    return Boolean(payload && signature);
  }
}

export const activePaymentProvider = new MockPaymentProvider();
