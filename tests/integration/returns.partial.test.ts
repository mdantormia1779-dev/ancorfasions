import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ReturnsService } from "@/services/shipping/returns.service";
import { ReturnRepository } from "@/repositories/return.repository";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { v4 as uuidv4 } from "uuid";

describe("Returns Partial and Quantity Tests", () => {
  const supabase = createAdminClient();
  let service: ReturnsService;
  let repo: ReturnRepository;

  let branchId = uuidv4();
  let customerId = 'bc067dfd-3df4-46ce-bb93-a6e8b603ee33';
  let orderId = uuidv4();
  let orderItem1Id = uuidv4();
  let orderItem2Id = uuidv4();

  beforeAll(async () => {
    service = new ReturnsService();
    repo = new ReturnRepository();

    const { error: err1 } = await supabase.from("branches").insert({ id: branchId, name: "Partial Branch", branch_code: `B-${Date.now()}-${Math.floor(Math.random()*1000)}`, address: "123 Test St" });
    if (err1) throw new Error("Insert failed on branches: " + err1.message);
    
    
    // Order with 2 items. Item 1 qty: 2. Item 2 qty: 1.
    const { error: err2 } = await supabase.from("orders").insert({ 
      id: orderId, 
      order_number: `ORD-PARTIAL-${Date.now()}`, 
      customer_id: customerId,
      branch_id: branchId, 
      status: "delivered", 
      payment_method: "sslcommerz", 
      payment_status: "paid", 
      grand_total: 300
    });
    if (err2) throw new Error("Insert failed on orders: " + err2.message);
    
    const { error: err3 } = await supabase.from("order_items").insert([
      { id: orderItem1Id, order_id: orderId, sku: `SKU-PART-1-${Date.now()}`, product_name: "Item 1", line_total: 200, quantity: 2, unit_price: 100 },
      { id: orderItem2Id, order_id: orderId, sku: `SKU-PART-2-${Date.now()}`, product_name: "Item 2", line_total: 100, quantity: 1, unit_price: 100 }
    ]);
    if (err3) throw new Error("Insert failed on order_items: " + err3.message);
  });

  afterAll(async () => {
    // Delete any returns created during test
    await supabase.from("returns").delete().eq("order_id", orderId);
    
    await supabase.from("orders").delete().eq("id", orderId);
    
    await supabase.from("branches").delete().eq("id", branchId);
  });

  it("Submit partial return for 1 unit of Item 1", async () => {
    const input = {
      orderId,
      reason: "Wrong size",
      items: [
        {
          orderItemId: orderItem1Id,
          quantity: 1,
          reason: "Wrong size"
        }
      ]
    };
    
    const ret = await service.submitCustomerReturn(input as any, customerId);
    
    expect(ret).toBeDefined();
    expect(ret.status).toBe("requested");
    expect(ret.items).toHaveLength(1);
    expect(ret.items![0].quantity).toBe(1);
    expect(ret.refund_amount).toBe(100); // 1 unit of 100
  });

  it("Reject return with quantity greater than remaining purchased", async () => {
    // Item 1 has 2 units originally. 1 was returned in previous test. Remaining: 1.
    const input = {
      orderId,
      reason: "Changed my mind",
      items: [
        {
          orderItemId: orderItem1Id,
          quantity: 2, // 2 is requested, but only 1 is eligible
          reason: "Changed my mind"
        }
      ]
    };
    
    await expect(service.submitCustomerReturn(input as any, customerId)).rejects.toThrow(/exceeds remaining eligible quantity/);
  });

  it("Reject return with zero quantity", async () => {
    const input = {
      orderId,
      reason: "Changed my mind",
      items: [
        {
          orderItemId: orderItem2Id,
          quantity: 0,
          reason: "Changed my mind"
        }
      ]
    };
    
    await expect(service.submitCustomerReturn(input as any, customerId)).rejects.toThrow(/Invalid return quantity/);
  });
});
