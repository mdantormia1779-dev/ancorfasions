import { describe, it, expect, vi, beforeEach } from "vitest";
import { paymentWebhookService } from "@/services/payment-webhook.service";
import { paymentRepository } from "@/repositories/payment.repository";
import { paymentFactory } from "@/providers/payment/payment.factory";

vi.mock("@/repositories/payment.repository", () => ({
  paymentRepository: {
    getProviderByCode: vi.fn(),
    createWebhookEvent: vi.fn(),
    updateWebhookEvent: vi.fn(),
  },
}));

describe("PaymentWebhookService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should process incoming webhook successfully", async () => {
    vi.mocked(paymentRepository.getProviderByCode).mockResolvedValue({
      id: "provider-1",
      code: "mock",
    } as any);
    vi.mocked(paymentRepository.createWebhookEvent).mockResolvedValue({
      id: "webhook-1",
      retry_count: 0,
    } as any);

    const mockProvider = {
      processWebhook: vi.fn().mockResolvedValue({ success: true }),
    };
    vi.spyOn(paymentFactory, "getProvider").mockReturnValue(
      mockProvider as any
    );

    const result = await paymentWebhookService.processWebhook(
      "mock",
      { type: "payment_success" },
      {}
    );

    expect(result.success).toBe(true);
    expect(paymentRepository.createWebhookEvent).toHaveBeenCalled();
    expect(mockProvider.processWebhook).toHaveBeenCalledWith(
      { type: "payment_success" },
      {}
    );
    expect(paymentRepository.updateWebhookEvent).toHaveBeenCalledWith(
      "webhook-1",
      expect.objectContaining({ status: "completed" })
    );
  });

  it("should handle webhook processing failure", async () => {
    vi.mocked(paymentRepository.getProviderByCode).mockResolvedValue({
      id: "provider-1",
      code: "mock",
    } as any);
    vi.mocked(paymentRepository.createWebhookEvent).mockResolvedValue({
      id: "webhook-1",
      retry_count: 0,
    } as any);

    const mockProvider = {
      processWebhook: vi.fn().mockRejectedValue(new Error("Invalid signature")),
    };
    vi.spyOn(paymentFactory, "getProvider").mockReturnValue(
      mockProvider as any
    );

    await expect(
      paymentWebhookService.processWebhook(
        "mock",
        { type: "payment_success" },
        {}
      )
    ).rejects.toThrow("Invalid signature");

    expect(paymentRepository.updateWebhookEvent).toHaveBeenCalledWith(
      "webhook-1",
      expect.objectContaining({
        status: "failed",
        last_error: "Invalid signature",
        retry_count: 1,
      })
    );
  });
});
