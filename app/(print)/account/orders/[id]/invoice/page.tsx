import React from "react";
import { getOrderDetailsAction } from "@/app/actions/oms/order.actions";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientQRCode } from "@/components/ui/ClientQRCode";

export default async function CustomerPrintInvoicePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/account/orders");
  }

  const result = await getOrderDetailsAction(params.id);
  if (!result.success || !result.data) {
    return notFound();
  }

  const order = result.data as any;

  // Authorization: Only the owner of the order can view it
  if (order.customer_id !== user.id) {
    return notFound();
  }

  const invoiceNumber = order.invoice_number || order.order_number.replace(/^ORD-/, "INV-");
  const invoiceDate = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const customerName =
    order.customer?.full_name ||
    order.shippingAddress?.recipient_name ||
    "Guest Customer";

  const customerPhone =
    order.customer?.phone ||
    order.shippingAddress?.phone ||
    "N/A";

  const isPaid = order.status === "paid" || order.paid_at;
  const isCod = order.payment_method === "COD";

  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://anchorfashion.com"}/track-order?ref=${order.order_number}`;

  return (
    <div className="w-[80mm] bg-white text-black p-4 mx-auto print:w-[80mm] print:p-0 print:m-0 font-mono text-xs leading-tight sm:max-w-none">
      <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />

      {/* Header */}
      <div className="text-center pb-3 border-b-2 border-black border-dashed mb-3">
        <h1 className="text-xl font-black uppercase tracking-wider">ANCHOR FASHION</h1>
        <p className="text-[10px] mt-1">Plot 42, Road 11, Block D, Banani</p>
        <p className="text-[10px]">Dhaka 1213, Bangladesh</p>
        <p className="text-[10px]">Ph: 1800-ANCHOR</p>
        <p className="text-[10px]">BIN: 001928374-0102</p>
      </div>

      <div className="text-center mb-4">
        <h2 className="text-lg font-bold uppercase">TAX INVOICE</h2>
        <p className="text-sm font-bold">#{invoiceNumber}</p>
        <p className="text-[10px]">{invoiceDate}</p>
      </div>

      <div className="mb-4">
        <p className="font-bold border-b border-black mb-1">Customer:</p>
        <p className="font-bold">{customerName}</p>
        <p>Ph: {customerPhone}</p>
        <p>Ref: {order.order_number}</p>
      </div>

      <table className="w-full text-left mb-4">
        <thead>
          <tr className="border-b border-black">
            <th className="py-1">Qty</th>
            <th className="py-1">Item</th>
            <th className="py-1 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {order.items?.map((item: any, idx: number) => (
            <tr key={item.id || idx} className="align-top border-b border-black border-dotted">
              <td className="py-2 pr-1">{item.quantity}x</td>
              <td className="py-2 pr-1">
                <p className="font-bold">{item.product_name}</p>
                {item.variant_name && <p className="text-[10px]">{item.variant_name}</p>}
                <p className="text-[10px]">SKU: {item.sku || "N/A"} @ ${Number(item.unit_price).toFixed(2)}</p>
              </td>
              <td className="py-2 text-right font-bold">
                ${Number(item.line_total).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-1 text-right mb-4 border-b-2 border-black border-dashed pb-3">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>${Number(order.subtotal).toFixed(2)}</span>
        </div>
        {Number(order.discount_total) > 0 && (
          <div className="flex justify-between">
            <span>Discount:</span>
            <span>-${Number(order.discount_total).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Tax (VAT):</span>
          <span>${Number(order.tax_total).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping:</span>
          <span>${Number(order.shipping_total).toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-black text-sm mt-1 pt-1 border-t border-black">
          <span>TOTAL:</span>
          <span>${Number(order.grand_total).toFixed(2)}</span>
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="font-bold border border-black p-1 mb-2 inline-block">
          {isPaid ? "STATUS: PAID" : `STATUS: ${order.status.toUpperCase()}`}
        </p>
        <p>Method: {order.payment_intent_id ? "Online" : "COD"}</p>
        
        {!isPaid && isCod && (
          <div className="mt-2 font-black text-lg border-2 border-black p-2">
            COD DUE: ${Number(order.grand_total).toFixed(2)}
          </div>
        )}
      </div>

      <div className="flex justify-center mb-4">
        <div className="bg-white p-1">
          <ClientQRCode value={trackingUrl} size={100} level="M" />
        </div>
      </div>

      <div className="text-center text-[10px] space-y-1">
        <p>Scan to track your order.</p>
        <p>Returns accepted within 7 days.</p>
        <p>Thank you for shopping with us!</p>
      </div>
    </div>
  );
}
