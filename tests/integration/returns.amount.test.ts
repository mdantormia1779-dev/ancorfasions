import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ReturnsService } from "@/services/shipping/returns.service";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { v4 as uuidv4 } from "uuid";

describe("Returns Amount Validation Tests", () => {
  const supabase = createAdminClient();
  let service: ReturnsService;

  let branchId = uuidv4();
  let customerId = 'bc067dfd-3df4-46ce-bb93-a6e8b603ee33';
  let orderId = uuidv4();
  let orderItem1Id = uuidv4();

  beforeAll(async () => {
    service = new ReturnsService();

    const { error: e1 } = await supabase.from("branches").insert({ id: branchId, name: "Amount Branch", branch_code: `B-AMT-${Date.now()}`, address: "123 Test St" });
    if (e1) throw new Error("branches insert: " + e1.message);

    // Order with grand_total as the only total column
    const { error: e2 } = await supabase.from("orders").insert({
      id: orderId,
      order_number: `ORD-AMT-${Date.now()}`,
      customer_id: customerId,
      branch_id: branchId,
      status: "delivered",
      payment_method: "sslcommerz",
      payment_status: "paid",
      grand_total: 400,    // net after discount
      discount_total: 100, // 20% discount
      subtotal: 500
    });
    if (e2) throw new Error("orders insert: " + e2.message);

    const { error: e3 } = await supabase.from("order_items").insert([
      { id: orderItem1Id, order_id: orderId, sku: `SKU-AMT-${Date.now()}`, product_name: "Item 1", line_total: 400, quantity: 2, unit_price: 200 }
    ]);
    if (e3) throw new Error("order_items insert: " + e3.message);
  });

  afterAll(async () => {
    await supabase.from("returns").delete().eq("order_id", orderId);
    await supabase.from("order_items").delete().eq("order_id", orderId);
    await supabase.from("orders").delete().eq("id", orderId);
    await supabase.from("branches").delete().eq("id", branchId);
  });

  it("Refund amount is based on line_total / quantity", async () => {
    const input = {
      orderId,
      reason: "Wrong size",
      items: [
        {
          orderItemId: orderItem1Id,
          quantity: 1, // Return 1 of 2 units
          reason: "Wrong size"
        }
      ]
    };

    const ret = await service.submitCustomerReturn(input as any, customerId);

    expect(ret).toBeDefined();
    // 400 line_total / 2 items = 200 per unit. Proportion of grand_total to subtotal is 400/500 = 0.8. 200 * 0.8 = 160.
    expect(Number(ret.refund_amount)).toBe(160);
  });

  it("Eligibility check works after a partial return", async () => {
    const eligibility = await service.checkReturnEligibility(orderId, customerId);
    expect(eligibility).toBeDefined();
    expect(typeof eligibility.maxRefundableAmount).toBe("number");
  });
});
