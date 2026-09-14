import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach, vi } from "vitest";
import { ReturnsService } from "@/services/shipping/returns.service";
import { ReturnRepository } from "@/repositories/return.repository";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { v4 as uuidv4 } from "uuid";

describe("Returns Refund Recovery Tests", () => {
  const supabase = createAdminClient();
  let service: ReturnsService;
  let repo: ReturnRepository;

  let branchId = uuidv4();
  let customerId = 'bc067dfd-3df4-46ce-bb93-a6e8b603ee33';
  let orderId = uuidv4();
  let returnId = "";

  beforeAll(async () => {
    service = new ReturnsService();
    repo = new ReturnRepository();

    const { error: e1 } = await supabase.from("branches").insert({ id: branchId, name: "Recov Branch", branch_code: `B-RECOV-${Date.now()}`, address: "123 Test St" });
    if (e1) throw new Error("branches: " + e1.message);

    const { error: e2 } = await supabase.from("orders").insert({
      id: orderId,
      order_number: `ORD-RECOV-${Date.now()}`,
      customer_id: customerId,
      branch_id: branchId,
      status: "delivered",
      payment_method: "sslcommerz",
      payment_status: "paid",
      grand_total: 100
    });
    if (e2) throw new Error("orders: " + e2.message);
  });

  afterAll(async () => {
    await supabase.from("orders").delete().eq("id", orderId);
    await supabase.from("branches").delete().eq("id", branchId);
  });

  beforeEach(async () => {
    const { data, error } = await supabase.from("returns").insert({
      return_number: `RET-RECOV-${Date.now()}`,
      order_id: orderId,
      customer_id: customerId,
      status: "inventory_synced",
      reason: "Test",
      refund_amount: 100,
      refund_status: "PENDING",
      // Use WALLET to avoid gateway payment_transaction lookup
      refund_method: "WALLET",
    }).select().single();

    if (error) throw new Error("return insert: " + error.message);
    returnId = data.id;
  });

  afterEach(async () => {
    await supabase.from("returns").delete().eq("id", returnId);
  });

  it("Wallet refund succeeds and transitions to COMPLETED", async () => {
    const res = await service.processReturnRefund(returnId, customerId);

    expect(res.success).toBe(true);
    expect(res.method).toBe("WALLET");

    // Verify DB state
    const ret = await repo.getReturnById(returnId);
    expect(ret?.refund_status).toBe("PROCESSED");
    expect(ret?.status).toBe("completed");
  });

  it("Refund twice safely no-ops: already PROCESSED returns success immediately", async () => {
    // First call
    const first = await service.processReturnRefund(returnId, customerId);
    expect(first.success).toBe(true);

    // Second call — should immediately return success because refund_status === "PROCESSED"
    const second = await service.processReturnRefund(returnId, customerId);
    expect(second.success).toBe(true);
  });
});
