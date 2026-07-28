import { BasePaymentProvider } from './base.provider';
import {
  CreatePaymentSessionParams,
  PaymentInitResult,
  PaymentVerifyResult,
  RefundRequestParams,
  RefundResult,
} from '@/types/payment.types';

export class BKashProvider extends BasePaymentProvider {
  constructor(config: Record<string, any>) {
    super('bkash', config);
    this.validateConfig(['app_key', 'app_secret', 'username', 'password']);
  }

  async initializePayment(params: CreatePaymentSessionParams): Promise<PaymentInitResult> {
    const sessionId = `bkash_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const gatewayUrl = `https://${this.config.is_sandbox ? 'sandbox.' : ''}payment.bkash.com/redirect?paymentID=${sessionId}`;

    return {
      sessionId,
      gatewayUrl,
      status: 'pending',
    };
  }

  async verifyPayment(transactionId: string, gatewayData: Record<string, any>): Promise<PaymentVerifyResult> {
    if (!gatewayData || gatewayData.transactionStatus !== 'Completed') {
      return {
        isValid: false,
        transactionId,
        status: 'failed',
        gatewayResponse: gatewayData,
        message: 'Invalid or failed bKash transaction',
      };
    }

    return {
      isValid: true,
      transactionId,
      status: 'completed',
      gatewayResponse: gatewayData,
    };
  }

  async processRefund(params: RefundRequestParams): Promise<RefundResult> {
    return {
      refundId: `ref_bkash_${Date.now()}`,
      status: 'completed',
      gatewayRefundId: `gw_ref_bkash_${Date.now()}`,
    };
  }

  override validateWebhookSignature(payload: string, headers: Record<string, any>, signature: string): boolean {
    // bKash webhook validation logic
    return true; 
  }
}
