import { BasePaymentProvider } from "./base.provider";
import {
  CreatePaymentSessionParams,
  PaymentInitResult,
  PaymentVerifyResult,
  RefundRequestParams,
  RefundResult,
} from "@/types/payment.types";

export class SSLCommerzProvider extends BasePaymentProvider {
  constructor(config: Record<string, any>) {
    super("sslcommerz", config);
    this.validateConfig(["store_id", "store_passwd"]);
  }

  async initializePayment(
    params: CreatePaymentSessionParams
  ): Promise<PaymentInitResult> {
    // Mock implementation for structural completeness
    // In production, this would make an HTTP request to the SSLCommerz API
    const sessionId = `ssl_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const gatewayUrl = `https://${this.config.is_sandbox ? "sandbox." : ""}sslcommerz.com/gwprocess/v4/api.php?session=${sessionId}`;

    return {
      sessionId,
      gatewayUrl,
      status: "pending",
    };
  }

  async verifyPayment(
    transactionId: string,
    gatewayData: Record<string, any>
  ): Promise<PaymentVerifyResult> {
    // Mock verify
    // Would validate via API endpoint using gatewayData.val_id
    if (!gatewayData || gatewayData.status !== "VALID") {
      return {
        isValid: false,
        transactionId,
        status: "failed",
        gatewayResponse: gatewayData,
        message: "Invalid or failed transaction reported by gateway",
      };
    }

    return {
      isValid: true,
      transactionId,
      status: "completed",
      gatewayResponse: gatewayData,
    };
  }

  async processRefund(params: RefundRequestParams): Promise<RefundResult> {
    // Mock refund
    return {
      refundId: `ref_ssl_${Date.now()}`,
      status: "completed",
      gatewayRefundId: `gw_ref_${Date.now()}`,
    };
  }

  override validateWebhookSignature(
    payload: string,
    headers: Record<string, any>,
    signature: string
  ): boolean {
    // Implement hash verification based on SSLCommerz docs
    // Example: verify IPN payload using verify_sign
    return true;
  }
}
