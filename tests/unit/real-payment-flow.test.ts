import { describe, it, expect } from "vitest";
import {
  getPendingManualPaymentsAction,
  approveManualPaymentAction,
  rejectManualPaymentAction,
  recordManualPaymentTransaction,
} from "@/lib/actions/payment.actions";
import { CourierFactory } from "@/lib/couriers/courier.factory";
import { createAdminClient } from "@/lib/supabase/admin-client";

describe("Real Product & Payment Lifecycle Integration Suite", () => {
  const supabase = createAdminClient();
  let testOrderId: string;
  let testTxId: string;
  const testOrderNumber = `TEST-E2E-${Date.now().toString().slice(-6)}`;

  let realProduct: any = null;

  it("1. Should retrieve active product from real catalog", async () => {
    const { data: product, error } = await supabase
      .from("products")
      .select("id, name, base_price, sku, status")
      .eq("status", "ACTIVE")
      .limit(1)
      .single();

    expect(error).toBeNull();
    expect(product).toBeDefined();
    expect(product?.name).toBeTruthy();
    expect(Number(product?.base_price)).toBeGreaterThan(0);
    realProduct = product;
  });

  it("2. Should create a real order with manual payment method (bKash) and order item", async () => {
    const { data: newOrder, error } = await supabase
      .from("orders")
      .insert({
        order_number: testOrderNumber,
        status: "pending_payment",
        payment_status: "PENDING",
        payment_method: "BKASH",
        currency: "BDT",
        subtotal: 1299,
        shipping_total: 60,
        grand_total: 1359,
        tax_total: 0,
        discount_total: 0,
        verification_status: "UNVERIFIED",
      })
      .select()
      .single();

    expect(error).toBeNull();
    expect(newOrder.id).toBeDefined();
    testOrderId = newOrder.id;

    const { error: itemError } = await supabase.from("order_items").insert({
      order_id: testOrderId,
      product_id: realProduct.id,
      product_name: realProduct.name,
      sku: realProduct.sku || "TEST-SKU",
      unit_price: 1299,
      quantity: 1,
      line_total: 1299,
    });
    expect(itemError).toBeNull();
  });

  it("3. Should record customer manual payment details with TrxID without UUID syntax error", async () => {
    const res = await recordManualPaymentTransaction({
      order_id: testOrderId,
      payment_method: "BKASH",
      amount: 1359,
      sender_number: "01811223344",
      transaction_id: `TRX-${Date.now()}`,
      notes: "Paid via personal bKash wallet",
    });

    expect(res.success).toBe(true);
    expect(res.transaction).toBeDefined();
    testTxId = res.transaction.id;
  });

  it("4. Should load pending manual payments queue without schema error", async () => {
    const list = await getPendingManualPaymentsAction();

    expect(Array.isArray(list)).toBe(true);
    const found = list.find((item) => item.order_id === testOrderId);
    expect(found).toBeDefined();
    expect(found.order?.order_number).toBe(testOrderNumber);
    expect(found.status).toBe("pending");
  });

  it("5. Should approve manual payment, advancing order to confirmed & paid", async () => {
    // 5a. Verify guard: An order with zero items must not be approved
    const emptyOrderRes = await approveManualPaymentAction("00000000-0000-0000-0000-000000000000");
    expect(emptyOrderRes.success).toBe(false);
    expect(emptyOrderRes.error).toContain("0 items");

    // 5b. An order with items must be successfully approved
    const approveRes = await approveManualPaymentAction(testOrderId, testTxId, "Verified via Merchant bKash Statement");
    expect(approveRes.success).toBe(true);

    const { data: updatedOrder } = await supabase
      .from("orders")
      .select("status, payment_status, paid_at")
      .eq("id", testOrderId)
      .single();

    expect(updatedOrder?.payment_status).toBe("paid");
    expect(updatedOrder?.status).toBe("confirmed");
    expect(updatedOrder?.paid_at).toBeTruthy();
  });

  it("6. Should dispatch confirmed order with Courier Provider", async () => {
    const provider = CourierFactory.getProvider("sandbox", {});
    const shipment = await provider.createShipment({
      orderId: testOrderId,
      invoiceNumber: testOrderNumber,
      recipientName: "Test Customer",
      recipientPhone: "01811223344",
      recipientAddress: "Mirpur DOHS, Dhaka",
      recipientCity: "Dhaka",
      weightKg: 1,
      codAmount: 0,
      isCOD: false,
    });

    expect(shipment.success).toBe(true);
    expect(shipment.consignmentId).toContain("CSID-");
    expect(shipment.trackingCode).toContain("SBOX-");
  });

  // Cleanup after verification
  it("7. Should clean up temporary test records cleanly", async () => {
    await supabase.from("order_items").delete().eq("order_id", testOrderId);
    await supabase.from("payment_transactions").delete().eq("order_id", testOrderId);
    await supabase.from("order_notes").delete().eq("order_id", testOrderId);
    await supabase.from("order_status_history").delete().eq("order_id", testOrderId);
    await supabase.from("orders").delete().eq("id", testOrderId);
  });
});
