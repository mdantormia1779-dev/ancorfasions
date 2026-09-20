import React from "react";
import { notFound, redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { ClientQRCode } from "@/components/ui/ClientQRCode";
import { ClientBarcode } from "@/components/ui/ClientBarcode";
import { InvoiceToolbar } from "@/components/print/invoice-toolbar";
import { ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

function formatBDT(amount: number | string | null | undefined): string {
  const num = Number(amount || 0);
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} BDT`;
}

export default async function CustomerPrintInvoicePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/account/orders");
  }

  const adminSupabase = await createAdminClient();
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.id);

  let orderQuery = adminSupabase
    .from("orders")
    .select(
      `
      *,
      order_items(*),
      order_status_history(*)
    `
    );

  if (isUuid) {
    orderQuery = orderQuery.eq("id", params.id);
  } else {
    orderQuery = orderQuery.eq("order_number", params.id);
  }

  const { data: order, error } = await orderQuery.maybeSingle();

  if (error || !order) {
    return notFound();
  }

  // Fetch order addresses separately as PostgREST does not have a schema cache relation from orders to order_addresses
  const { data: orderAddresses } = await adminSupabase
    .from("order_addresses")
    .select("*")
    .eq("order_id", order.id);

  order.order_addresses = orderAddresses || [];

  const shippingAddress =
    order.order_addresses?.find((a: any) => a.address_type === "SHIPPING") ||
    order.shippingAddress ||
    order.order_addresses?.[0] ||
    null;

  // Fetch customer profile if customer_id is present
  let customer: any = null;
  if (order.customer_id) {
    try {
      const { data: cProfile } = await adminSupabase
        .from("customer_profiles")
        .select("first_name, last_name, email, phone")
        .eq("id", order.customer_id)
        .maybeSingle();
      const { data: pProfile } = await adminSupabase
        .from("profiles")
        .select("first_name, last_name, phone")
        .eq("id", order.customer_id)
        .maybeSingle();
      const fn = cProfile?.first_name || pProfile?.first_name || "";
      const ln = cProfile?.last_name || pProfile?.last_name || "";
      const full = [fn, ln].filter(Boolean).join(" ");
      customer = {
        full_name: full || null,
        first_name: fn,
        last_name: ln,
        phone: cProfile?.phone || pProfile?.phone || null,
        email: cProfile?.email || null,
      };
    } catch {
      // ignore
    }
  }

  // Authorization: Order owner, staff/management, or matching customer email can view invoice
  if (order.customer_id && order.customer_id !== user.id) {
    let role = user.user_metadata?.role || user.app_metadata?.role;
    if (!role) {
      const { data: profile } = await adminSupabase
        .from("profiles")
        .select("roles(name)")
        .eq("id", user.id)
        .maybeSingle();
      role = String(
        Array.isArray(profile?.roles)
          ? profile?.roles[0]?.name
          : (profile?.roles as any)?.name || ""
      );
    }
    const roleUpper = String(role || "").toUpperCase();
    const isStaff = [
      "SUPERADMIN",
      "ADMIN",
      "MANAGER",
      "WAREHOUSE_MANAGER",
      "MARKETING_MANAGER",
      "FINANCE_MANAGER",
      "STAFF",
      "SUPPORT",
    ].includes(roleUpper);

    const isEmailOwner = Boolean(
      user.email &&
      (
        (shippingAddress?.email && user.email.toLowerCase() === shippingAddress.email.toLowerCase()) ||
        (customer?.email && user.email.toLowerCase() === customer.email.toLowerCase())
      )
    );

    if (!isStaff && !isEmailOwner) {
      return notFound();
    }
  }

  // Fetch courier shipments if available
  let activeShipment: any = null;
  try {
    const { data: shipments } = await adminSupabase
      .from("shipments")
      .select("*, courier_providers(name, logo_url)")
      .eq("order_id", order.id)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false })
      .limit(1);
    activeShipment = shipments?.[0] || null;
  } catch {
    // Non-critical, fallback to standard shipping
  }

  const items = (order.order_items && order.order_items.length > 0)
    ? order.order_items
    : (order.items || []);

  const invoiceNumber = order.invoice_number || (order.order_number ? order.order_number.replace(/^ORD-/, "INV-") : "INV-ONLINE");
  const orderNumber = order.order_number || order.id?.slice(0, 8).toUpperCase() || "ORD-0000";

  const orderDate = new Date(order.created_at || Date.now()).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const printDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const addressFullName = shippingAddress
    ? [shippingAddress.first_name, shippingAddress.last_name].filter(Boolean).join(" ")
    : "";

  const customerName =
    customer?.full_name ||
    order.customer?.full_name ||
    addressFullName ||
    shippingAddress?.recipient_name ||
    (customer?.first_name ? `${customer.first_name} ${customer.last_name || ""}`.trim() : "") ||
    "Valued Customer";

  const customerPhone =
    shippingAddress?.phone ||
    customer?.phone ||
    order.customer?.phone ||
    "N/A";

  const customerEmail =
    customer?.email ||
    order.customer?.email ||
    shippingAddress?.email ||
    "N/A";

  const recipientName = addressFullName || shippingAddress?.recipient_name || customerName;
  const recipientPhone = shippingAddress?.phone || customerPhone;

  const formatAddress = (addr: any) => {
    if (!addr) return "Standard Delivery Address";
    const line1 = addr.address_line_1 || addr.street || "";
    const line2 = addr.address_line_2 ? `, ${addr.address_line_2}` : "";
    const city = addr.city ? `, ${addr.city}` : "";
    const zip = addr.zip || addr.postal_code ? ` - ${addr.zip || addr.postal_code}` : "";
    const country = addr.country ? `, ${addr.country}` : ", Bangladesh";
    const full = `${line1}${line2}${city}${zip}${country}`.replace(/^,\s*/, "");
    return full || "Banani, Dhaka, Bangladesh";
  };

  const deliveryAddress = formatAddress(shippingAddress);

  const statusLower = (order.status || "").toLowerCase();
  const paymentStatusLower = (order.payment_status || "").toLowerCase();
  const isPaid = paymentStatusLower === "paid" || statusLower === "paid" || !!order.paid_at;
  const isCod = (order.payment_method || "").toUpperCase() === "COD" || !isPaid;

  const totalItemsCount = items.reduce((acc: number, it: any) => acc + (Number(it.quantity) || 1), 0);
  const totalLineItems = items.length;

  const subtotal = Number(order.subtotal ?? items.reduce((acc: number, it: any) => acc + (Number(it.line_total ?? it.total_price ?? (Number(it.unit_price) * Number(it.quantity)))), 0));
  const grandTotal = Number(order.grand_total ?? order.total_amount ?? subtotal);

  const courierName = activeShipment?.courier_providers?.name || activeShipment?.courier_provider_code || "Anchor Express Delivery";
  const trackingNumber = activeShipment?.tracking_number || null;

  const trackingUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://anchorfashion.com"}/track-order?ref=${orderNumber}`;

  return (
    <div className="min-h-screen bg-slate-100 py-6 sm:py-10 print:py-0 print:bg-white text-slate-900 font-sans antialiased">
      {/* Screen Toolbar & AutoPrint */}
      <InvoiceToolbar
        backUrl={`/account/orders/${order.id}`}
        backLabel="Back to Order Details"
      />

      {/* Printable Sheet Container */}
      <div className="relative max-w-4xl mx-auto bg-white border border-slate-200 print:border-none shadow-md print:shadow-none p-8 sm:p-10 print:p-6 overflow-hidden">
        
        {/* Subtle Security Diagonal Watermark Background */}
        <div 
          className="pointer-events-none absolute inset-0 opacity-[0.035] select-none z-0" 
          aria-hidden="true"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='260' height='120' viewBox='0 0 260 120'%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle' fill='%23122B59' font-family='sans-serif' font-size='13' font-weight='800' letter-spacing='0.2em' transform='rotate(-25 130 60)'%3EANCHOR FASHION%3C/text%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
          }}
        />

        <div className="relative z-10 space-y-6">
          {/* Header Block */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            {/* Brand Logo & Tagline */}
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#122B59] text-[#C9A86A] shadow-xs">
                  {/* Anchor Emblem Icon */}
                  <svg
                    className="w-7 h-7"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="5" r="3" />
                    <line x1="12" y1="22" x2="12" y2="8" />
                    <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-2xl font-black tracking-widest text-[#122B59] leading-none">
                      ANCHOR
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-[1px] w-5 bg-[#C9A86A]"></div>
                    <span className="text-[10px] tracking-[0.25em] font-bold text-[#C9A86A] uppercase leading-none">
                      FASHION
                    </span>
                    <div className="h-[1px] w-5 bg-[#C9A86A]"></div>
                  </div>
                </div>
              </div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mt-2">
                Operations & Customer Fulfillment Hub
              </p>
            </div>

            {/* Document Title & Badge */}
            <div className="sm:text-right flex flex-col items-start sm:items-end">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#122B59] uppercase leading-none">
                Customer Tax Invoice
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="bg-[#122B59] text-white text-[11px] font-bold px-3 py-1 rounded uppercase tracking-wider">
                  ONLINE STORE · BANGLADESH
                </span>
                {isPaid ? (
                  <span className="bg-emerald-600 text-white text-[11px] font-bold px-3 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    PAID IN FULL
                  </span>
                ) : (
                  <span className="bg-amber-600 text-white text-[11px] font-bold px-3 py-1 rounded uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    COD DUE UPON DELIVERY
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Corporate Double Accent Stripe (Signature Brand Element) */}
          <div className="w-full h-1.5 bg-[#122B59] rounded-t-xs relative">
            <div className="absolute inset-x-0 bottom-0 h-[2px] bg-[#C9A86A]"></div>
          </div>

          {/* Metadata Grid Block (4 columns, matching ERP Chalan PDF layout) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50/90 border border-slate-200 rounded-lg text-xs">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Statement / Inv Ref.</p>
              <p className="font-bold text-slate-900 font-mono text-sm mt-0.5">{invoiceNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Order Reference</p>
              <p className="font-bold text-slate-900 font-mono text-sm mt-0.5">{orderNumber}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Order Date</p>
              <p className="font-semibold text-slate-800 mt-0.5">{orderDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Print Date</p>
              <p className="font-semibold text-slate-800 mt-0.5">{printDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Method</p>
              <p className="font-semibold text-slate-800 mt-0.5">
                {order.payment_intent_id ? "Online (bKash/Card)" : isCod ? "Cash on Delivery (COD)" : "Prepaid"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Status</p>
              <p className={`font-bold mt-0.5 uppercase ${isPaid ? "text-emerald-700" : "text-amber-700"}`}>
                {isPaid ? "Paid" : "Pending (Collect COD)"}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Logistics Partner</p>
              <p className="font-semibold text-slate-800 mt-0.5">{courierName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Records</p>
              <p className="font-semibold text-slate-800 mt-0.5">
                {totalLineItems} {totalLineItems === 1 ? "line item" : "line items"} ({totalItemsCount} pcs)
              </p>
            </div>
          </div>

          {/* Customer & Shipping Destination Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Bill To */}
            <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Customer Details (Bill To)
                </span>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-medium text-slate-600">
                  {order.customer?.tier || "Retail Customer"}
                </span>
              </div>
              <p className="font-bold text-sm text-slate-900">{customerName}</p>
              <p className="text-slate-600 font-mono">Phone: {customerPhone}</p>
              <p className="text-slate-600">Email: {customerEmail}</p>
              <p className="text-slate-500 text-[11px] pt-1">
                Account ID: {order.customer_id ? `USR-${order.customer_id.slice(0, 8).toUpperCase()}` : "Guest Checkout"}
              </p>
            </div>

            {/* Ship To */}
            <div className="p-4 rounded-lg border border-slate-200 bg-white space-y-1">
              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 mb-2">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Shipping Destination (Deliver To)
                </span>
                {trackingNumber && (
                  <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold">
                    TRK: {trackingNumber}
                  </span>
                )}
              </div>
              <p className="font-bold text-sm text-slate-900">{recipientName}</p>
              <p className="text-slate-600 font-mono">Contact: {recipientPhone}</p>
              <p className="text-slate-700 leading-relaxed">{deliveryAddress}</p>
            </div>
          </div>

          {/* Statement Summary & Totals (Matching exact section in user's PDF) */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/70">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Statement Summary & Totals
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {/* Badge 1 */}
              <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C9A86A] text-[11px] font-bold text-white shadow-xs">
                    1
                  </span>
                  <span className="font-medium text-slate-600">Total Line Items</span>
                </div>
                <span className="font-black text-slate-900 text-sm">{totalLineItems}</span>
              </div>

              {/* Badge 2 */}
              <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#C9A86A] text-[11px] font-bold text-white shadow-xs">
                    2
                  </span>
                  <span className="font-medium text-slate-600">Total Unit Quantity</span>
                </div>
                <span className="font-black text-slate-900 text-sm">{totalItemsCount} pcs</span>
              </div>

              {/* Badge 3 */}
              <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded border border-[#122B59]/20 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#122B59] text-[11px] font-bold text-white shadow-xs">
                    3
                  </span>
                  <span className="font-medium text-slate-700">Total Payable Value</span>
                </div>
                <span className="font-black text-[#122B59] text-sm">
                  {formatBDT(grandTotal)}
                </span>
              </div>
            </div>
          </div>

          {/* Statement Details Table (Matching user's PDF table) */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Statement Details
            </h3>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#122B59] text-white uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-2.5 px-3 text-center w-10">#</th>
                    <th className="py-2.5 px-3">Product Name & Description</th>
                    <th className="py-2.5 px-3">SKU / Code</th>
                    <th className="py-2.5 px-3 text-center w-16">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Total Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.map((item: any, idx: number) => {
                    const unitPrice = Number(item.unit_price) || 0;
                    const lineTotal = Number(item.line_total ?? item.total_price ?? (unitPrice * Number(item.quantity || 1)));

                    return (
                      <tr 
                        key={item.id || idx} 
                        className={idx % 2 === 1 ? "bg-slate-50/50" : "bg-white"}
                      >
                        <td className="py-3 px-3 text-center font-mono text-slate-500 font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <p className="font-bold text-slate-900 text-sm leading-snug">
                            {item.product_name}
                          </p>
                          {item.variant_name && (
                            <span className="inline-block mt-1 text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              {item.variant_name}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                          {item.sku || "—"}
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-900">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-3 text-right font-medium text-slate-700">
                          {formatBDT(unitPrice)}
                        </td>
                        <td className="py-3 px-3 text-right font-bold text-slate-950">
                          {formatBDT(lineTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Financial & Compliance Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Left: Notes, QR Code & Payment Status */}
            <div className="space-y-4">
              {/* Payment Settlement Alert */}
              {isPaid ? (
                <div className="p-3 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-950 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <ShieldCheck className="h-4 w-4 text-emerald-700" />
                    PAID IN FULL · TRANSACTION VERIFIED
                  </div>
                  <p className="text-[11px] text-emerald-800">
                    Payment was confirmed online. No further collection is required upon parcel handover.
                  </p>
                </div>
              ) : (
                <div className="p-3 rounded-lg border-2 border-amber-500 bg-amber-50/80 text-amber-950 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-black text-sm text-amber-900 uppercase tracking-wide">
                    <AlertCircle className="h-4 w-4 text-amber-700" />
                    COD DUE UPON DELIVERY: {formatBDT(grandTotal)}
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Please keep the exact amount ready for the delivery partner upon parcel handover.
                  </p>
                </div>
              )}

              {/* Scannable Tracking QR Card */}
              <div className="flex items-center gap-3.5 p-3 rounded-lg border border-slate-200 bg-slate-50/60">
                <div className="bg-white p-1 rounded border border-slate-200 shrink-0 shadow-2xs">
                  <ClientQRCode value={trackingUrl} size={74} level="M" />
                </div>
                <div className="text-xs space-y-0.5">
                  <p className="font-bold text-slate-900">Scan to Verify & Track Order</p>
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    Point your camera or barcode scanner to view live courier tracking and verify authentic Anchor Fashion warranty status.
                  </p>
                </div>
              </div>

              {/* Official ERP Compliance Notes */}
              <div className="space-y-1 text-[10px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="font-bold uppercase tracking-wider text-slate-800">NOTES & TERMS:</p>
                <p>• This document is system-generated by Anchor Fashion ERP System.</p>
                <p>• For official customer records and exchange validation. Unauthorized modification is strictly prohibited.</p>
                <p>• Exchange or return requests are accepted within 7 days of delivery in original unworn condition with tags intact.</p>
                <p>• Customer Helpline: <span className="font-semibold text-slate-800">1800-ANCHOR</span> · Email: <span className="font-semibold text-slate-800">support@anchorfashion.com</span></p>
              </div>
            </div>

            {/* Right: Detailed Cost Summary Table */}
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 overflow-hidden text-xs">
                <div className="bg-slate-100/80 px-4 py-2 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                  Financial Settlement Breakdown
                </div>
                <div className="p-4 space-y-2.5">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Items Subtotal:</span>
                    <span className="font-semibold text-slate-900">{formatBDT(subtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Shipping & Delivery Fee:</span>
                    <span className="font-semibold text-slate-900">{formatBDT(order.shipping_total)}</span>
                  </div>

                  {Number(order.discount_total || 0) > 0 && (
                    <div className="flex justify-between items-center text-emerald-700">
                      <span>Promotional Discount:</span>
                      <span className="font-semibold">-{formatBDT(order.discount_total)}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-slate-600">
                    <span>Applicable VAT / Tax (Included):</span>
                    <span className="font-semibold text-slate-900">{formatBDT(order.tax_total || 0)}</span>
                  </div>

                  {/* Net Grand Total Highlight Bar */}
                  <div className="border-t-2 border-slate-300 pt-2.5 mt-2">
                    <div className="flex justify-between items-center bg-[#122B59] text-white p-3 rounded-md shadow-sm">
                      <span className="font-bold text-sm tracking-wide">TOTAL PAYABLE:</span>
                      <span className="font-black text-base tracking-tight">
                        {formatBDT(grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barcode representation */}
              <div className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-200 bg-white">
                <ClientBarcode
                  value={orderNumber}
                  format="CODE128"
                  width={1.6}
                  height={32}
                  fontSize={11}
                  background="transparent"
                />
                <span className="text-[9px] uppercase tracking-widest text-slate-400 mt-1">
                  Anchor Fashion Verification Barcode
                </span>
              </div>
            </div>
          </div>

          {/* Official Signatures Block (Matching Page 2 of user's PDF) */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-3 gap-6 text-xs text-slate-600 page-break-inside-avoid">
            <div className="text-center">
              <div className="border-b border-slate-400 w-3/4 mx-auto mb-2"></div>
              <p className="font-bold text-slate-900">Prepared By</p>
              <p className="text-[10px] text-slate-500">Warehouse & Logistics</p>
            </div>
            <div className="text-center">
              <div className="border-b border-slate-400 w-3/4 mx-auto mb-2"></div>
              <p className="font-bold text-slate-900">Verified By</p>
              <p className="text-[10px] text-slate-500">Quality Control & Dispatch</p>
            </div>
            <div className="text-center">
              <div className="border-b border-slate-400 w-3/4 mx-auto mb-2"></div>
              <p className="font-bold text-slate-900">Authorized / Received By</p>
              <p className="text-[10px] text-slate-500">Customer Signature</p>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 space-y-0.5 pt-2">
            <p>Generation Date: {printDate}</p>
            <p>This is a computer-generated electronic statement and does not require a physical signature.</p>
          </div>

          {/* Document Bottom Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-[10px] text-slate-500">
            <span>ANCHOR FASHION ERP · Official Tax Invoice · Confidential & Proprietary</span>
            <span>Printed on {printDate} · Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
