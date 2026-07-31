/**
 * @jest-environment node
 * SandboxProvider Unit Tests
 */

import { SandboxProvider } from "@/services/courier/providers/sandbox.provider";
import { ConsignmentRequest } from "@/types/shipping.types";

const SAMPLE_REQUEST: ConsignmentRequest = {
  orderId: "order-uuid-001",
  invoiceNumber: "INV-001",
  recipientName: "Rahim Hossain",
  recipientPhone: "01711111111",
  recipientAddress: "House 12, Road 5, Dhanmondi, Dhaka",
  recipientCity: "Dhaka",
  codAmount: 1500,
  isCOD: true,
  weight: 0.5,
};

describe("SandboxProvider", () => {
  let provider: SandboxProvider;

  beforeEach(() => {
    // @ts-ignore — reset static store between tests
    SandboxProvider.trackingStore = new Map();
    provider = new SandboxProvider({}, true);
  });

  it("should have correct id", () => {
    expect(provider.id).toBe("sandbox");
    expect(provider.isSandbox).toBe(true);
  });

  it("should create consignment successfully", async () => {
    const result = await provider.createConsignment(SAMPLE_REQUEST);
    expect(result.success).toBe(true);
    expect(result.data?.trackingCode).toMatch(/^SBOX-/);
    expect(result.data?.consignmentId).toMatch(/^CSID-/);
    expect(result.data?.status).toBe("created");
  });

  it("should cancel consignment successfully", async () => {
    const create = await provider.createConsignment(SAMPLE_REQUEST);
    const cancel = await provider.cancelConsignment(create.data!.consignmentId);
    expect(cancel.success).toBe(true);
  });

  it("should track shipment by existing tracking code", async () => {
    const create = await provider.createConsignment(SAMPLE_REQUEST);
    const tracking = await provider.trackShipment(create.data!.trackingCode);

    expect(tracking.success).toBe(true);
    expect(tracking.data?.status).toBe("created");
    expect(tracking.data?.updates.length).toBeGreaterThanOrEqual(1);
  });

  it("should track unknown tracking code with fallback data", async () => {
    const tracking = await provider.trackShipment("UNKNOWN-TRACKING-999");
    expect(tracking.success).toBe(true);
    expect(tracking.data?.status).toBe("in_transit");
  });

  it("should advance lifecycle status", async () => {
    const create = await provider.createConsignment(SAMPLE_REQUEST);
    const code = create.data!.trackingCode;

    const newStatus = SandboxProvider.advanceStatus(code);
    expect(newStatus).toBe("pickup_requested");

    const tracking = await provider.trackShipment(code);
    expect(tracking.data?.status).toBe("pickup_requested");
  });

  it("should generate label URL", async () => {
    const result = await provider.generateLabel("CSID-TEST-123");
    expect(result.success).toBe(true);
    expect(result.data?.labelUrl).toContain("CSID-TEST-123");
  });

  it("should process webhook event", async () => {
    const result = await provider.processWebhook(
      {
        trackingNumber: "SBOX-TEST",
        consignmentId: "CSID-TEST",
        status: "delivered",
        eventTime: new Date().toISOString(),
      },
      ""
    );

    expect(result.success).toBe(true);
    expect(result.data?.status).toBe("delivered");
  });

  it("should simulate failure when configured", async () => {
    const failProvider = new SandboxProvider({ simulateFailure: true }, true);
    const result = await failProvider.createConsignment(SAMPLE_REQUEST);
    expect(result.success).toBe(false);
    expect(result.error?.code).toBe("SANDBOX_FAILURE");
  });
});
