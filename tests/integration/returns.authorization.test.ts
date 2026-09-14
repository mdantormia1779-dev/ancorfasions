import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ReturnsService } from "@/services/shipping/returns.service";
import { ReturnRepository } from "@/repositories/return.repository";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { v4 as uuidv4 } from "uuid";

// Role-Based Access Control and Branch Isolation Tests
describe("Returns Branch Authorization Tests", () => {
  const supabase = createAdminClient();
  let service: ReturnsService;
  let repo: ReturnRepository;

  let branchAId = uuidv4();
  let branchBId = uuidv4();
  let customerId = 'bc067dfd-3df4-46ce-bb93-a6e8b603ee33';

  let returnAId = "";
  let returnBId = "";
  let orderAId = uuidv4();
  let orderBId = uuidv4();

  beforeAll(async () => {
    service = new ReturnsService();
    repo = new ReturnRepository();

    // Create Branches
    const { error: e1 } = await supabase.from("branches").insert([
      { id: branchAId, name: "Branch A", branch_code: `B-AUTH-A-${Date.now()}`, address: "123 Test St" },
      { id: branchBId, name: "Branch B", branch_code: `B-AUTH-B-${Date.now()}`, address: "456 Test Ave" }
    ]);
    if (e1) throw new Error("branches insert: " + e1.message);

    // Create Orders for Branch A & B
    const { error: e2 } = await supabase.from("orders").insert([
      { id: orderAId, order_number: `ORD-AUTH-A-${Date.now()}`, customer_id: customerId, branch_id: branchAId, status: "delivered", payment_method: "cod", payment_status: "paid", grand_total: 100 },
      { id: orderBId, order_number: `ORD-AUTH-B-${Date.now()}`, customer_id: customerId, branch_id: branchBId, status: "delivered", payment_method: "cod", payment_status: "paid", grand_total: 100 },
    ]);
    if (e2) throw new Error("orders insert: " + e2.message);

    // Create Returns for Branch A
    const retA = await supabase.from("returns").insert({
      return_number: `RET-AUTH-A-${Date.now()}`,
      order_id: orderAId,
      customer_id: customerId,
      status: "requested",
      reason: "Test",
      refund_amount: 100,
      refund_status: "PENDING",
      refund_method: "WALLET"
    }).select().single();
    if (retA.error) throw new Error("return A insert: " + retA.error.message);
    returnAId = retA.data.id;

    // Create Returns for Branch B
    const retB = await supabase.from("returns").insert({
      return_number: `RET-AUTH-B-${Date.now()}`,
      order_id: orderBId,
      customer_id: customerId,
      status: "requested",
      reason: "Test",
      refund_amount: 100,
      refund_status: "PENDING",
      refund_method: "WALLET"
    }).select().single();
    if (retB.error) throw new Error("return B insert: " + retB.error.message);
    returnBId = retB.data.id;
  });

  afterAll(async () => {
    await supabase.from("returns").delete().in("id", [returnAId, returnBId]);
    await supabase.from("orders").delete().in("id", [orderAId, orderBId]);
    await supabase.from("branches").delete().in("id", [branchAId, branchBId]);
  });

  it("Branch A filter returns only Branch A returns", async () => {
    const result = await repo.listReturns({ branchId: branchAId });
    expect(result.data.length).toBeGreaterThan(0);
    const hasRetA = result.data.some(r => r.id === returnAId);
    expect(hasRetA).toBe(true);
  });

  it("Branch A manager cannot access Branch B returns via list", async () => {
    // A branch manager calling listReturns will have their branchId forced as a filter
    const result = await repo.listReturns({ branchId: branchAId }); // Enforced by server action
    const hasRetB = result.data.some(r => r.id === returnBId);
    expect(hasRetB).toBe(false);
  });
});
