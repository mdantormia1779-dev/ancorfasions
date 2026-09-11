"use client";

import React from "react";
import { OrderWithDetails } from "@/types/oms";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Printer, X } from "lucide-react";

interface OrderInvoicePrintProps {
  order: OrderWithDetails;
  onClose?: () => void;
}

export function OrderInvoicePrint({ order, onClose }: OrderInvoicePrintProps) {
  const handlePrint = () => {
    window.print();
  };

  const customerName =
    order.customer?.full_name ||
    order.shippingAddress?.recipient_name ||
    "Guest Customer";

  const customerPhone =
    order.customer?.phone ||
    order.shippingAddress?.phone ||
    "N/A";

  const formatAddress = (addr: any) => {
    if (!addr) return "Not provided";
    const line1 = addr.address_line_1 || addr.street || "";
    const line2 = addr.address_line_2 ? `, ${addr.address_line_2}` : "";
    const city = addr.city ? `, ${addr.city}` : "";
    const zip = addr.zip || addr.postal_code ? ` - ${addr.zip || addr.postal_code}` : "";
    const country = addr.country ? `, ${addr.country}` : "";
    return `${line1}${line2}${city}${zip}${country}`.replace(/^,\s*/, "") || "Address not provided";
  };

  const invoiceDate = new Date(order.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-y-auto p-4 sm:p-8 flex flex-col items-center print:p-0 print:static print:bg-white print:overflow-visible">
      {/* Action Bar (Hidden when printing) */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Invoice
          </Button>
          <span className="text-xs text-muted-foreground">
            Opens browser print dialog configured for standard A4 invoice.
          </span>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose} className="gap-1.5">
            <X className="h-4 w-4" />
            Close Preview
          </Button>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible !important;
          }
          #printable-invoice {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 24px !important;
            background: white !important;
            color: black !important;
          }
        }
      `}} />

      {/* Printable Invoice Container */}
      <div
        id="printable-invoice"
        className="w-full max-w-4xl bg-white text-slate-900 border shadow-md rounded-lg p-8 sm:p-12 print:shadow-none print:border-none print:m-0 print:p-0 print:w-full print:max-w-none print:rounded-none"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start pb-8 border-b border-slate-200 gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-wider text-slate-950 uppercase">
                ANCHOR FASHION
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">
              Enterprise Ready-Made Garments & Luxury Apparel
            </p>
            <div className="mt-3 text-xs text-slate-600 space-y-0.5">
              <p>Plot 42, Road 11, Block D, Banani</p>
              <p>Dhaka 1213, Bangladesh</p>
              <p>Phone: +880 1800-ANCHOR | Email: billing@anchorfashion.com</p>
              <p>BIN / Tax ID: 001928374-0102</p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              TAX INVOICE
            </h2>
            <p className="text-sm font-semibold text-slate-600 mt-1">
              Invoice #{order.order_number.replace(/^ORD-/, "INV-")}
            </p>
            <div className="mt-3 text-xs text-slate-600 space-y-1">
              <p>
                <span className="font-semibold text-slate-700">Invoice Date:</span>{" "}
                {invoiceDate}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Order Reference:</span>{" "}
                {order.order_number}
              </p>
              <p>
                <span className="font-semibold text-slate-700">Payment Status:</span>{" "}
                <span className="font-bold text-emerald-700 uppercase">
                  {order.status === "paid" || order.paid_at ? "PAID" : order.status.toUpperCase()}
                </span>
              </p>
              <p>
                <span className="font-semibold text-slate-700">Payment Method:</span>{" "}
                {order.payment_intent_id ? "Online Gateway" : "Cash on Delivery / Account Credit"}
              </p>
            </div>
          </div>
        </div>

        {/* Addresses Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 py-6 border-b border-slate-200">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Billed To
            </h3>
            <p className="text-sm font-bold text-slate-900">{customerName}</p>
            {order.customer?.email && (
              <p className="text-xs text-slate-600 mt-0.5">{order.customer.email}</p>
            )}
            <p className="text-xs text-slate-600">Phone: {customerPhone}</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {formatAddress(order.billingAddress || order.shippingAddress)}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Shipped To
            </h3>
            <p className="text-sm font-bold text-slate-900">
              {order.shippingAddress?.recipient_name || customerName}
            </p>
            <p className="text-xs text-slate-600">Phone: {customerPhone}</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {formatAddress(order.shippingAddress)}
            </p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-slate-900 text-slate-800 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-2">#</th>
                <th className="py-3 px-2">Description / Item</th>
                <th className="py-3 px-2">SKU</th>
                <th className="py-3 px-2 text-right">Unit Price</th>
                <th className="py-3 px-2 text-center">Qty</th>
                <th className="py-3 px-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {order.items?.map((item, idx) => (
                <tr key={item.id || idx} className="text-slate-800">
                  <td className="py-3 px-2 text-slate-500">{idx + 1}</td>
                  <td className="py-3 px-2">
                    <p className="font-semibold text-slate-900">{item.product_name}</p>
                    {item.variant_name && (
                      <p className="text-[11px] text-slate-500">Variant: {item.variant_name}</p>
                    )}
                  </td>
                  <td className="py-3 px-2 font-mono text-slate-600">{item.sku || "N/A"}</td>
                  <td className="py-3 px-2 text-right font-mono">
                    ${Number(item.unit_price).toFixed(2)}
                  </td>
                  <td className="py-3 px-2 text-center font-semibold">{item.quantity}</td>
                  <td className="py-3 px-2 text-right font-mono font-bold text-slate-900">
                    ${Number(item.line_total).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary */}
        <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row justify-between items-start gap-6">
          <div className="w-full sm:w-1/2 space-y-2 text-xs text-slate-500">
            <h4 className="font-semibold text-slate-700 uppercase tracking-wider text-[11px]">
              Terms & Conditions
            </h4>
            <p className="leading-relaxed">
              1. Goods received in good condition cannot be returned after 7 days from delivery.
            </p>
            <p className="leading-relaxed">
              2. For warranty or sizing exchanges, please retain this invoice and product tags.
            </p>
          </div>

          <div className="w-full sm:w-1/2 max-w-xs ml-auto space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-medium">${Number(order.subtotal).toFixed(2)}</span>
            </div>
            {Number(order.discount_total) > 0 && (
              <div className="flex justify-between text-emerald-700">
                <span>Discounts / Promotions:</span>
                <span className="font-mono font-medium">-${Number(order.discount_total).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-slate-600">
              <span>Estimated Tax (VAT):</span>
              <span className="font-mono font-medium">${Number(order.tax_total).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Standard Shipping:</span>
              <span className="font-mono font-medium">${Number(order.shipping_total).toFixed(2)}</span>
            </div>
            <div className="border-t-2 border-slate-900 pt-2 flex justify-between text-base font-extrabold text-slate-950">
              <span>Grand Total:</span>
              <span className="font-mono">${Number(order.grand_total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Authorized Signatures */}
        <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-500">
          <div>
            <div className="border-b border-slate-300 w-48 mb-1"></div>
            <p className="font-medium text-slate-700">Customer Acceptance</p>
            <p className="text-[10px]">Received in satisfactory condition</p>
          </div>
          <div className="text-right flex flex-col items-end">
            <div className="border-b border-slate-300 w-48 mb-1"></div>
            <p className="font-medium text-slate-700">Authorized Signatory</p>
            <p className="text-[10px]">Anchor Fashion Enterprise Ltd</p>
          </div>
        </div>
      </div>
    </div>
  );
}
