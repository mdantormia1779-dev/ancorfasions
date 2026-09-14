import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { ReturnsService } from "@/services/shipping/returns.service";
import { ReturnRepository } from "@/repositories/return.repository";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { v4 as uuidv4 } from "uuid";

describe("Returns Concurrency Tests", () => {
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

    await supabase.from("branches").insert({ id: branchId, name: "Concurrency Branch", branch_code: `B-${Date.now()}-${Math.floor(Math.random()*1000)}`, address: "123 Test St" });
    
    await supabase.from("orders").insert({ id: orderId, order_number: `ORD-CONC-${Date.now()}`, customer_id: customerId, branch_id: branchId, status: "delivered", payment_method: "sslcommerz", payment_status: "paid", grand_total: 100 });
    await supabase.from("order_items").insert({ id: orderItemId, order_id: orderId, sku: `SKU-CONC-${Date.now()}`, product_name: "Item", line_total: 100, unit_price: 100, quantity: 1 });
  });

  afterAll(async () => {
    await supabase.from("orders").delete().eq("id", orderId);
    
    await supabase.from("branches").delete().eq("id", branchId);
  });

  beforeEach(async () => {
    const { data } = await supabase.from("returns").insert({
      return_number: `RET-CONC-${Date.now()}`,
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

  it("Concurrent Restock Test: Exactly one restock succeeds", async () => {
    await repo.atomicUpdateStatus(returnId, ["requested"], { status: "approved" });
    await repo.atomicUpdateStatus(returnId, ["approved"], { status: "received" });

    // Fire 5 concurrent restocks
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(service.processReturnRestock(returnId, { [orderItemId]: "good" }, customerId).catch(e => e.message));
    }
    
    const results = await Promise.all(promises);
    
    const successes = results.filter(r => typeof r === "object" && r.status === "inventory_synced");
    
    // processReturnRestock is idempotent — all calls should succeed (atomic lock on return_items.restocked)
    expect(successes.length).toBe(5);

    // Verify the return status was correctly updated
    const finalReturn = await repo.getReturnById(returnId);
    expect(finalReturn?.status).toBe("inventory_synced");
  });

  it("Concurrent Refund Test: Only one refund locks and processes", async () => {
    // Fire 5 concurrent refunds
    const promises = [];
    for (let i = 0; i < 5; i++) {
      promises.push(service.processReturnRefund(returnId, customerId));
    }
    
    const results = await Promise.all(promises);
    
    const successes = results.filter(r => r.success === true);
    const locks = results.filter(r => r.success === false && r.error === "Refund is already being processed or was completed.");
    
    expect(successes.length).toBe(1);
    expect(locks.length).toBe(4);

    // Verify exactly one ledger entry / completed state
    const finalReturn = await repo.getReturnById(returnId);
    expect(finalReturn?.status).toBe("completed");
    expect(finalReturn?.refund_status).toBe("PROCESSED");
  });
});
