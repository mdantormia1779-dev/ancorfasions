import React from "react";
import { CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";
import { ClientBarcode } from "@/components/ui/ClientBarcode";

export interface InvoiceItem {
  id?: string;
  product_name: string;
  variant_name?: string | null;
  sku?: string | null;
  quantity: number | string;
  unit_price: number | string;
  line_total?: number | string;
  total_price?: number | string;
}

export interface InvoiceData {
  invoiceNumber: string;
  orderNumber: string;
  orderDate: string;
  printDate: string;
  customer: {
    name: string;
    phone: string;
    email?: string | null;
    address: string;
  };
  order: {
    paymentMethod: string;
    paymentStatus: string;
    isPaid: boolean;
    isCod: boolean;
    courierName: string;
    trackingNumber?: string | null;
    subtotal: number;
    shippingTotal: number;
    discountTotal: number;
    taxTotal?: number;
    grandTotal: number;
  };
  items: InvoiceItem[];
}

function formatBDT(amount: number | string | null | undefined): string {
  const num = Number(amount || 0);
  return `${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} BDT`;
}

export function InvoiceSheet({ data }: { data: InvoiceData }) {
  const { invoiceNumber, orderNumber, orderDate, printDate, customer, order, items } = data;

  const totalQuantity = items.reduce((acc, it) => acc + (Number(it.quantity) || 1), 0);

  return (
    <div className="relative w-full max-w-[800px] mx-auto bg-white border border-slate-200 print:border-none shadow-sm print:shadow-none p-6 sm:p-8 print:p-0 print:max-w-none print:w-full text-slate-900 font-sans text-xs print:text-[11px] leading-normal print:leading-tight break-inside-avoid print:break-inside-avoid" style={{ pageBreakInside: "avoid" }}>
      
      {/* 1. Header: Business Details & Invoice Reference */}
      <div className="flex flex-row justify-between items-start gap-4 pb-3">
        {/* Left: Brand Logo & Business Information */}
        <div className="space-y-1 max-w-[50%]">
          {/* Official Brand Logo */}
          <div className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="Anchor Fashion"
              className="h-11 sm:h-12 w-auto object-contain block"
            />
          </div>
          <p className="text-[11px] font-semibold text-slate-700 pt-0.5">
            Anchor Fashion Lifestyle & Apparel
          </p>
          <div className="text-[10px] text-slate-500 space-y-0.5 leading-tight">
            <p>123 Fashion Avenue, Dhaka 1212, Bangladesh</p>
            <p>
              Hotline: <span className="font-semibold text-slate-700">+880 1234 567890</span> · Email: <span className="font-semibold text-slate-700">support@anchorfashion.com</span>
            </p>
            <p>Website: <span className="font-semibold text-slate-700">www.anchorfashion.com</span></p>
          </div>
        </div>

        {/* Right: Document Identification & Status */}
        <div className="text-right space-y-1">
          <h1 className="text-2xl font-black tracking-wider text-[#122B59] uppercase leading-none">
            INVOICE
          </h1>
          <div className="pt-0.5 space-y-0.5">
            <p className="font-mono font-bold text-slate-900 text-sm">{invoiceNumber}</p>
            <p className="text-[10px] text-slate-500">
              Order Ref: <span className="font-mono font-semibold text-slate-800">{orderNumber}</span>
            </p>
            <p className="text-[10px] text-slate-500">
              Date: <span className="font-medium text-slate-700">{orderDate}</span>
            </p>
          </div>

          <div className="pt-1">
            {order.isPaid ? (
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" />
                PAID IN FULL
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-amber-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded shadow-xs uppercase tracking-wider">
                <AlertCircle className="w-3 h-3" />
                CASH ON DELIVERY (COD)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Corporate Accent Stripe: Navy Blue & Gold */}
      <div className="w-full h-1 bg-[#122B59] rounded-t-xs relative mb-3">
        <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-[#C9A86A]"></div>
      </div>

      {/* 2. Customer & Order Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Customer Information */}
        <div className="p-2.5 rounded border border-slate-200 bg-slate-50/70 space-y-1">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1 mb-1">
            <span className="font-bold text-[#122B59] uppercase tracking-wider text-[10px]">
              Customer Details (Bill & Ship To)
            </span>
          </div>
          <p className="font-bold text-slate-900 text-xs">{customer.name}</p>
          <p className="text-slate-700 font-mono text-[11px]">
            <span className="text-slate-500 font-sans">Phone:</span> {customer.phone}
          </p>
          {customer.email && customer.email !== "N/A" && (
            <p className="text-slate-600 text-[11px] truncate">
              <span className="text-slate-500">Email:</span> {customer.email}
            </p>
          )}
          <p className="text-slate-700 text-[11px] leading-snug pt-0.5">
            <span className="text-slate-500">Address:</span> {customer.address}
          </p>
        </div>

        {/* Order & Delivery Summary */}
        <div className="p-2.5 rounded border border-slate-200 bg-slate-50/70 space-y-1">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-1 mb-1">
            <span className="font-bold text-[#122B59] uppercase tracking-wider text-[10px]">
              Order & Shipping Details
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
            <div>
              <span className="text-slate-500 text-[10px] block">Payment Method</span>
              <span className="font-semibold text-slate-800">{order.paymentMethod}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Payment Status</span>
              <span className={`font-bold ${order.isPaid ? "text-emerald-700" : "text-amber-700"}`}>
                {order.isPaid ? "Paid Online" : "COD Pending"}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Courier Partner</span>
              <span className="font-semibold text-slate-800">{order.courierName}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Tracking No.</span>
              <span className="font-mono font-semibold text-slate-800">{order.trackingNumber || "Assigned at Dispatch"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Items Table */}
      <div className="rounded border border-slate-200 overflow-hidden mb-3">
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className="bg-[#122B59] text-white uppercase text-[9.5px] tracking-wider font-semibold">
              <th className="py-1.5 px-2.5 text-center w-8">#</th>
              <th className="py-1.5 px-2.5">Item Description</th>
              <th className="py-1.5 px-2.5 w-24">SKU</th>
              <th className="py-1.5 px-2.5 text-center w-12">Qty</th>
              <th className="py-1.5 px-2.5 text-right w-24">Unit Price</th>
              <th className="py-1.5 px-2.5 text-right w-28">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.map((item, idx) => {
              const unitPrice = Number(item.unit_price) || 0;
              const qty = Number(item.quantity) || 1;
              const lineTotal = Number(item.line_total ?? item.total_price ?? (unitPrice * qty));

              return (
                <tr key={item.id || idx} className={idx % 2 === 1 ? "bg-slate-50/50" : "bg-white"}>
                  <td className="py-1.5 px-2.5 text-center font-mono text-slate-500 font-medium">
                    {idx + 1}
                  </td>
                  <td className="py-1.5 px-2.5">
                    <span className="font-bold text-slate-900 leading-tight block">
                      {item.product_name}
                    </span>
                    {item.variant_name && (
                      <span className="inline-block mt-0.5 text-[9.5px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                        {item.variant_name}
                      </span>
                    )}
                  </td>
                  <td className="py-1.5 px-2.5 font-mono text-slate-500 text-[10px]">
                    {item.sku || "—"}
                  </td>
                  <td className="py-1.5 px-2.5 text-center font-bold text-slate-900">
                    {qty}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-medium text-slate-700">
                    {formatBDT(unitPrice)}
                  </td>
                  <td className="py-1.5 px-2.5 text-right font-bold text-slate-950">
                    {formatBDT(lineTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 4. Settlement & Financial Breakdown */}
      <div className="grid grid-cols-2 gap-4 items-start mb-4">
        {/* Left: Settlement Note, Exchange Policy & Barcode */}
        <div className="space-y-2">
          {/* Payment Note */}
          {order.isPaid ? (
            <div className="p-2 rounded border border-emerald-200 bg-emerald-50/70 text-emerald-950 text-[10.5px]">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-700" />
                Payment Confirmed Online
              </div>
              <p className="text-[10px] text-emerald-800 mt-0.5">
                Full amount paid online. No collection needed upon parcel delivery.
              </p>
            </div>
          ) : (
            <div className="p-2 rounded border border-amber-300 bg-amber-50/80 text-amber-950 text-[10.5px]">
              <div className="flex items-center gap-1.5 font-bold text-amber-900">
                <AlertCircle className="h-3.5 w-3.5 text-amber-700" />
                COD Payable: {formatBDT(order.grandTotal)}
              </div>
              <p className="text-[10px] text-amber-800 mt-0.5">
                Please keep exact cash ready for courier handover.
              </p>
            </div>
          )}

          {/* Return & Support Note */}
          <div className="p-2 rounded border border-slate-200 bg-slate-50/60 text-[10px] text-slate-600 space-y-0.5">
            <p className="font-semibold text-slate-700 uppercase tracking-wide text-[9.5px]">
              Customer Support & Return Policy:
            </p>
            <p>• 7-day exchange warranty with original unworn condition & attached tags.</p>
            <p>• For inquiries, call <strong>+880 1234 567890</strong> or email <strong>support@anchorfashion.com</strong>.</p>
          </div>

          {/* Compact Barcode */}
          <div className="flex flex-col items-start pt-0.5">
            <ClientBarcode
              value={orderNumber}
              format="CODE128"
              width={1.3}
              height={24}
              fontSize={10}
              margin={0}
              background="transparent"
            />
          </div>
        </div>

        {/* Right: Financial Cost Breakdown */}
        <div className="rounded border border-slate-200 overflow-hidden bg-white text-[11px]">
          <div className="bg-[#122B59]/5 px-3 py-1.5 border-b border-slate-200 font-bold text-[#122B59] uppercase tracking-wider text-[9.5px]">
            Statement Summary ({items.length} {items.length === 1 ? "Item" : "Items"} · {totalQuantity} Pcs)
          </div>
          <div className="p-2.5 space-y-1.5">
            <div className="flex justify-between items-center text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold text-slate-900">{formatBDT(order.subtotal)}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>Delivery / Shipping Fee:</span>
              <span className="font-semibold text-slate-900">{formatBDT(order.shippingTotal)}</span>
            </div>

            {Number(order.discountTotal || 0) > 0 && (
              <div className="flex justify-between items-center text-emerald-700 font-medium">
                <span>Promotional Discount:</span>
                <span>-{formatBDT(order.discountTotal)}</span>
              </div>
            )}

            {Number(order.taxTotal || 0) > 0 && (
              <div className="flex justify-between items-center text-slate-600">
                <span>VAT / Tax (Included):</span>
                <span className="font-semibold text-slate-900">{formatBDT(order.taxTotal)}</span>
              </div>
            )}

            {/* Net Total Highlight Box */}
            <div className="border-t border-slate-200 pt-1.5 mt-1">
              <div className="flex justify-between items-center bg-[#122B59] text-white px-3 py-2 rounded shadow-xs">
                <span className="font-bold text-xs tracking-wider uppercase">
                  TOTAL AMOUNT:
                </span>
                <span className="font-black text-sm tracking-tight text-[#C9A86A]">
                  {formatBDT(order.grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Official Signatures & Footer Close */}
      <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-8 text-[10px] text-slate-600">
        <div className="text-center">
          <div className="border-b border-slate-400 w-36 mx-auto mb-1"></div>
          <p className="font-bold text-slate-800">Authorized Signature</p>
          <p className="text-slate-400">Anchor Fashion Dispatch</p>
        </div>
        <div className="text-center">
          <div className="border-b border-slate-400 w-36 mx-auto mb-1"></div>
          <p className="font-bold text-slate-800">Customer Signature</p>
          <p className="text-slate-400">Received In Good Condition</p>
        </div>
      </div>

      <div className="pt-3 text-center text-[9.5px] text-slate-400 border-t border-slate-100 mt-3 flex justify-between items-center">
        <span>Anchor Fashion ERP · Official Invoice</span>
        <span>Printed on {printDate}</span>
        <span>Thank you for shopping with us!</span>
      </div>
    </div>
  );
}
