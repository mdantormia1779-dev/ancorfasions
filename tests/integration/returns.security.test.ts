import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ReturnsService } from "@/services/shipping/returns.service";
import { ReturnRepository } from "@/repositories/return.repository";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { v4 as uuidv4 } from "uuid";

describe("Returns Security & Malicious Input Tests", () => {
  const supabase = createAdminClient();
  let service: ReturnsService;

  let branchId = uuidv4();
  let customerId = 'bc067dfd-3df4-46ce-bb93-a6e8b603ee33';
  let orderId = uuidv4();

  beforeAll(async () => {
    service = new ReturnsService();

    const { error: err1 } = await supabase.from("branches").insert({ id: branchId, name: "Sec Branch", branch_code: `B-${Date.now()}-${Math.floor(Math.random()*1000)}`, address: "123 Test St" });
    if (err1) throw err1;
    const { error: err2 } = await supabase.from("orders").insert({ id: orderId, order_number: `ORD-SEC-${Date.now()}`, customer_id: customerId, branch_id: branchId, status: "delivered", payment_method: "sslcommerz", payment_status: "paid", grand_total: 100 });
    if (err2) throw err2;
    const { error: err3 } = await supabase.from("order_items").insert([
      { id: uuidv4(), order_id: orderId, sku: `SKU-SEC-${Date.now()}`, product_name: "Sec Item", line_total: 100, quantity: 1, unit_price: 100 }
    ]);
    if (err3) throw err3;
  });

  afterAll(async () => {
    await supabase.from("orders").delete().eq("id", orderId);
    
    await supabase.from("branches").delete().eq("id", branchId);
  });

  it("Rejects non-existent return ID safely", async () => {
    const fakeId = uuidv4();
    await expect(service.processReturnRestock(fakeId)).rejects.toThrow(`Return ${fakeId} not found`);
    await expect(service.processReturnRefund(fakeId)).rejects.toThrow(`Return ${fakeId} not found`);
  });

  it("Rejects returning an order that belongs to another customer", async () => {
    const maliciousUserId = uuidv4();
    const ret = service.submitCustomerReturn({
      orderId: orderId,
      reason: "Wrong size",
      items: []
    } as any, maliciousUserId);
    await expect(ret).rejects.toThrow("Unauthorized: You do not own this order.");
  });

  it("Rejects returning an order that is not delivered yet", async () => {
    const notDeliveredOrderId = uuidv4();
    const { error: err } = await supabase.from("orders").insert({ id: notDeliveredOrderId, order_number: `ORD-ND-${Date.now()}`,  customer_id: customerId, branch_id: branchId, status: "confirmed", grand_total: 100 });
    if (err) throw err;
    
    await expect(service.submitCustomerReturn({
      orderId: notDeliveredOrderId,
      reason: "Wrong size",
      items: []
    } as any, customerId)).rejects.toThrow("Order must be delivered before requesting a return.");
    
    await supabase.from("orders").delete().eq("id", notDeliveredOrderId);
  });
  
  it("Validates invalid reason", async () => {
    const eligibility = await service.checkReturnEligibility(orderId, customerId);
    await expect(service.submitCustomerReturn({
      orderId,
      reason: "Hacked reason",
      items: [{ orderItemId: eligibility.items[0]?.orderItemId, quantity: 1, reason: "Hacked reason" }]
    } as any, customerId)).rejects.toThrow(/Invalid return reason/);
  });
});
