import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { ReturnsService } from "@/services/shipping/returns.service";
import { ReturnRepository } from "@/repositories/return.repository";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { v4 as uuidv4 } from "uuid";

describe("Returns Idempotency Tests", () => {
  const supabase = createAdminClient();
  let service: ReturnsService;
  let repo: ReturnRepository;

  let branchId = uuidv4();
  let customerId = 'bc067dfd-3df4-46ce-bb93-a6e8b603ee33';
  let orderId = uuidv4();
  let orderItemId = uuidv4();
  let returnId = "";

  beforeAll(async () => {
    service = new ReturnsService();
    repo = new ReturnRepository();

    await supabase.from("branches").insert({ id: branchId, name: "Idempotency Branch", branch_code: `B-${Date.now()}-${Math.floor(Math.random()*1000)}`, address: "123 Test St" });
    
    await supabase.from("orders").insert({ id: orderId, order_number: `ORD-IDEM-${Date.now()}`, customer_id: customerId, branch_id: branchId, status: "delivered", payment_method: "sslcommerz", payment_status: "paid", grand_total: 100 });
    await supabase.from("order_items").insert({ id: orderItemId, order_id: orderId, sku: `SKU-IDEM-${Date.now()}`, product_name: "Item", line_total: 100, quantity: 1, unit_price: 100 });
  });

  afterAll(async () => {
    await supabase.from("orders").delete().eq("id", orderId);
    
    await supabase.from("branches").delete().eq("id", branchId);
  });

  beforeEach(async () => {
    const { data } = await supabase.from("returns").insert({
      return_number: `RET-IDEM-${Date.now()}`,
      order_id: orderId,
      customer_id: customerId,
      status: "requested",
      reason: "Test",
      refund_amount: 100,
      refund_status: "PENDING",
      refund_method: "WALLET",
    }).select().single();
    
    returnId = data.id;
    await supabase.from("return_items").insert({ return_id: returnId, order_item_id: orderItemId, quantity: 1, condition: "unknown", restocked: false });
  });

  afterEach(async () => {
    await supabase.from("returns").delete().eq("id", returnId);
  });

  it("Approve twice safely fails second attempt", async () => {
    const first = await repo.atomicUpdateStatus(returnId, ["requested"], { status: "approved" });
    expect(first.status).toBe("approved");

    await expect(repo.atomicUpdateStatus(returnId, ["requested"], { status: "approved" })).rejects.toThrow(/Invalid state transition/);
  });

  it("Receive twice safely fails second attempt", async () => {
    await repo.atomicUpdateStatus(returnId, ["requested"], { status: "approved" });
    const first = await repo.atomicUpdateStatus(returnId, ["approved"], { status: "received" });
    expect(first.status).toBe("received");

    await expect(repo.atomicUpdateStatus(returnId, ["approved"], { status: "received" })).rejects.toThrow(/Invalid state transition/);
  });

  it("Restock twice safely fails or no-ops second attempt", async () => {
    await repo.atomicUpdateStatus(returnId, ["requested"], { status: "approved" });
    await repo.atomicUpdateStatus(returnId, ["approved"], { status: "received" });

    const first = await service.processReturnRestock(returnId, {}, customerId);
    expect(first.status).toBe("inventory_synced");

    const second = await service.processReturnRestock(returnId, {}, customerId);
    expect(second.status).toBe("inventory_synced");
  });

  it("Refund twice safely fails or no-ops second attempt", async () => {
    const first = await service.processReturnRefund(returnId, customerId);
    expect(first.success).toBe(true);

    const second = await service.processReturnRefund(returnId, customerId);
    // processReturnRefund is designed to return { success: true, method: original_method } if already processed
    expect(second.success).toBe(true);
    expect(second.method).toBeDefined();
  });
});
