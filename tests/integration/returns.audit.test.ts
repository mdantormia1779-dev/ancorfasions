import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { ReturnsService } from "@/services/shipping/returns.service";
import { ReturnRepository } from "@/repositories/return.repository";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { v4 as uuidv4 } from "uuid";

describe("Returns Audit Log Tests", () => {
  const supabase = createAdminClient();
  let repo: ReturnRepository;

  let branchId = uuidv4();
  let customerId = 'bc067dfd-3df4-46ce-bb93-a6e8b603ee33';
  let orderId = uuidv4();
  let returnId = "";

  beforeAll(async () => {
    repo = new ReturnRepository();

    await supabase.from("branches").insert({ id: branchId, name: "Audit Branch", branch_code: `B-${Date.now()}-${Math.floor(Math.random()*1000)}`, address: "123 Test St" });
    
    await supabase.from("orders").insert({ id: orderId, order_number: `ORD-AUDIT-${Date.now()}`, branch_id: branchId, status: "delivered", payment_method: "sslcommerz", payment_status: "paid", grand_total: 100 });
    
    const { data } = await supabase.from("returns").insert({
      return_number: `RET-AUDIT-${Date.now()}`,
      order_id: orderId,
      customer_id: customerId,
      status: "requested",
      reason: "Test",
      refund_amount: 100,
      refund_status: "PENDING",
      refund_method: "WALLET",
    }).select().single();
    
    returnId = data.id;
  });

  afterAll(async () => {
    await supabase.from("order_notes").delete().eq("order_id", orderId);
    await supabase.from("returns").delete().eq("id", returnId);
    await supabase.from("orders").delete().eq("id", orderId);
    
    await supabase.from("branches").delete().eq("id", branchId);
  });

  it("Records audit note on successful status transition", async () => {
    await repo.atomicUpdateStatus(returnId, ["requested"], { status: "approved" }, customerId);
    
    const { data: notes } = await supabase.from("order_notes").select("*").eq("order_id", orderId);
    expect(notes).toBeDefined();
    expect(notes!.length).toBeGreaterThan(0);
    const note = notes!.find(n => n.note.includes("Status changed to 'approved'"));
    expect(note).toBeDefined();
    expect(note!.author_id).toBe(customerId);
  });

  it("Does not record audit note on failed transition", async () => {
    const { data: notesBefore } = await supabase.from("order_notes").select("*").eq("order_id", orderId);
    const countBefore = notesBefore?.length || 0;

    await expect(repo.atomicUpdateStatus(returnId, ["received"], { status: "completed" }, customerId)).rejects.toThrow();

    const { data: notesAfter } = await supabase.from("order_notes").select("*").eq("order_id", orderId);
    const countAfter = notesAfter?.length || 0;
    
    expect(countAfter).toBe(countBefore);
  });
});
