import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import { ReturnsService } from "@/services/shipping/returns.service";
import { ReturnRepository } from "@/repositories/return.repository";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { v4 as uuidv4 } from "uuid";

// We execute against a real dev/test database. No mocks.
describe("Returns State-Machine Tests", () => {
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

    await supabase.from("branches").insert({
      id: branchId,
      name: "State Machine Test Branch", branch_code: `B-${Date.now()}-${Math.floor(Math.random()*1000)}`, address: "123 Test St",
      
      
      
    });

    

    await supabase.from("orders").insert({
      id: orderId,
      order_number: `ORD-STATE-${Date.now()}`,
      customer_id: customerId,
      branch_id: branchId,
      status: "delivered",
      payment_method: "sslcommerz",
      payment_status: "paid",
      grand_total: 100,
    });

    await supabase.from("order_items").insert({
      id: orderItemId,
      order_id: orderId,
      sku: `SKU-STATE-${Date.now()}`,
      product_name: "State Item",
      quantity: 1,
      unit_price: 100,
      line_total: 100,
    });
  });

  afterAll(async () => {
    await supabase.from("orders").delete().eq("id", orderId);
    
    await supabase.from("branches").delete().eq("id", branchId);
  });

  beforeEach(async () => {
    const { data, error } = await supabase.from("returns").insert({
      return_number: `RET-SM-${Date.now()}`,
      order_id: orderId,
      customer_id: customerId,
      status: "requested",
      reason: "Test",
      refund_amount: 100,
      refund_status: "PENDING",
      refund_method: "WALLET",
    }).select().single();
    
    if (error) {
      console.error("INSERT ERROR returns:", error);
      throw error;
    }
    returnId = data.id;

    await supabase.from("return_items").insert({
      return_id: returnId,
      order_item_id: orderItemId,
      quantity: 1,
      condition: "unknown",
      restocked: false,
    });
  });

  afterEach(async () => {
    await supabase.from("returns").delete().eq("id", returnId);
  });

  it("Valid transitions: Requested -> Approved -> Received -> Inspected -> Completed", async () => {
    // Approve
    const approved = await repo.atomicUpdateStatus(returnId, ["requested"], { status: "approved" }, customerId);
    expect(approved.status).toBe("approved");

    // Receive
    const received = await repo.atomicUpdateStatus(returnId, ["approved"], { status: "received" }, customerId);
    expect(received.status).toBe("received");

    // Restock / Inspect
    const restocked = await service.processReturnRestock(returnId, {}, customerId);
    expect(restocked.status).toBe("inventory_synced");

    // Complete / Refund
    const completed = await service.processReturnRefund(returnId, customerId);
    expect(completed.success).toBe(true);

    const final = await repo.getReturnById(returnId);
    expect(final?.status).toBe("completed");
  });

  it("Invalid transition: Requested -> Received", async () => {
    await expect(repo.atomicUpdateStatus(returnId, ["approved"], { status: "received" }, customerId))
      .rejects.toThrow(/Invalid state transition/);
  });

  it("Invalid transition: Requested -> Completed", async () => {
    await expect(repo.atomicUpdateStatus(returnId, ["received", "inventory_synced"], { status: "completed" }, customerId))
      .rejects.toThrow(/Invalid state transition/);
  });

  it("Invalid transition: Rejected -> Received", async () => {
    await repo.atomicUpdateStatus(returnId, ["requested"], { status: "rejected" }, customerId);
    await expect(repo.atomicUpdateStatus(returnId, ["approved"], { status: "received" }, customerId))
      .rejects.toThrow(/Invalid state transition/);
  });

  it("Invalid transition: Completed -> Approved", async () => {
    await repo.atomicUpdateStatus(returnId, ["requested"], { status: "approved" }, customerId);
    await repo.atomicUpdateStatus(returnId, ["approved"], { status: "received" }, customerId);
    await repo.atomicUpdateStatus(returnId, ["received"], { status: "inventory_synced" }, customerId);
    await service.processReturnRefund(returnId, customerId);

    const final = await repo.getReturnById(returnId);
    expect(final?.status).toBe("completed");

    await expect(repo.atomicUpdateStatus(returnId, ["requested"], { status: "approved" }, customerId))
      .rejects.toThrow(/Invalid state transition/);
  });
});
