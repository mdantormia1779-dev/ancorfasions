"use client";

import React, { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { CheckoutFormValues } from "@/schemas/checkout.schema";
import { PaymentGatewayConfig } from "@/lib/actions/payment.actions";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Check, Info, Landmark, Smartphone, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface ManualPaymentFieldsProps {
  form: UseFormReturn<CheckoutFormValues>;
  selectedMethod: string;
  config?: PaymentGatewayConfig;
}

export function ManualPaymentFields({
  form,
  selectedMethod,
  config,
}: ManualPaymentFieldsProps) {
  const [copied, setCopied] = useState(false);
  const method = selectedMethod.toUpperCase();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Account number copied to clipboard!");
    setTimeout(() => setCopied(false), 2500);
  };

  if (method === "COD") {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4 text-xs text-emerald-900 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-emerald-800">Cash on Delivery (ক্যাশ অন ডেলিভারি)</p>
          <p className="text-emerald-700 leading-relaxed">
            {config?.instructions ||
              "পণ্য হাতে পেয়ে দেখে ডেলিভারি ম্যানের কাছে মূল্য পরিশোধ করুন। ঢাকার ভেতরে ১-২ দিন এবং ঢাকার বাইরে ৩-৫ দিনে ডেলিভারি সম্পন্ন হবে।"}
          </p>
        </div>
      </div>
    );
  }

  if (method === "SSLCOMMERZ") {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
        <p className="text-blue-800 leading-relaxed">
          You will be redirected to the secure SSLCommerz gateway to complete payment via Visa, MasterCard, Amex, or Mobile Banking.
        </p>
      </div>
    );
  }

  const isBkash = method === "BKASH";
  const isNagad = method === "NAGAD";
  const isRocket = method === "ROCKET";
  const isBank = method === "BANK_TRANSFER" || method === "BANK";

  const brandColor = isBkash
    ? "border-pink-300 bg-pink-50/60 text-pink-950"
    : isNagad
    ? "border-orange-300 bg-orange-50/60 text-orange-950"
    : isRocket
    ? "border-purple-300 bg-purple-50/60 text-purple-950"
    : "border-sky-300 bg-sky-50/60 text-sky-950";

  const brandBadge = isBkash
    ? "bg-pink-600 text-white"
    : isNagad
    ? "bg-orange-600 text-white"
    : isRocket
    ? "bg-purple-600 text-white"
    : "bg-slate-800 text-white";

  const accountNumber =
    config?.account_number ||
    (isBkash
      ? "01700000000"
      : isNagad
      ? "01800000000"
      : isRocket
      ? "01900000000-0"
      : "123.456.7890");

  const accountType = config?.account_type || "Personal";

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-in fade-in-50 duration-200">
      {/* Merchant / Receiver Info Banner */}
      <div className={`rounded-lg border p-4 text-xs ${brandColor} space-y-2`}>
        <div className="flex items-center justify-between">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${brandBadge}`}>
            {method.replace(/_/g, " ")} ({accountType})
          </span>
          {accountNumber && (
            <button
              type="button"
              onClick={() => handleCopy(accountNumber)}
              className="inline-flex items-center gap-1 font-semibold text-[11px] bg-white/80 hover:bg-white px-2 py-0.5 rounded border shadow-xs transition"
            >
              {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? "Copied" : "Copy Number"}</span>
            </button>
          )}
        </div>

        {isBank ? (
          <div className="space-y-1.5 pt-1 text-slate-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div>
                <span className="text-slate-500 font-medium">Bank Name:</span>{" "}
                <span className="font-bold">{config?.bank_name || "Dutch-Bangla Bank Ltd"}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Account Name:</span>{" "}
                <span className="font-bold">{config?.account_name || "Anchor Fashion Ltd"}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Account Number:</span>{" "}
                <span className="font-mono font-bold">{accountNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Branch Name:</span>{" "}
                <span className="font-bold">{config?.branch_name || "Gulshan Branch, Dhaka"}</span>
              </div>
              {config?.routing_number && (
                <div>
                  <span className="text-slate-500 font-medium">Routing No:</span>{" "}
                  <span className="font-mono font-bold">{config.routing_number}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 pt-1">
            <Smartphone className="h-4 w-4 opacity-70" />
            <span className="text-sm font-bold font-mono tracking-wider">{accountNumber}</span>
            <span className="text-[11px] font-medium opacity-80">({accountType})</span>
          </div>
        )}

        <p className="text-[11px] leading-relaxed pt-1 border-t border-black/5 opacity-90">
          {config?.instructions ||
            `Please transfer your total order amount to the ${accountType} account above. Once completed, enter your sender details and Transaction ID (TrxID) below.`}
        </p>
      </div>

      {/* Customer Input Fields */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
          <ShieldAlert className="h-3.5 w-3.5 text-blue-600" />
          <span>Payment Submission Details (পেমেন্টের তথ্য প্রদান করুন)</span>
        </div>

        {isBank ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="payment.manual_payment.bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Your Bank Name (প্রেরক ব্যাংক)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. City Bank, Brac Bank, DBBL" {...field} value={field.value || ""} className="h-9 text-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="payment.manual_payment.account_holder_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs">Account Holder / Depositor Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Tanvir Ahmed" {...field} value={field.value || ""} className="h-9 text-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="payment.manual_payment.transaction_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Deposit Slip No / Transaction Reference <span className="text-rose-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. DEP-98271625 / TXN109283" {...field} value={field.value || ""} className="h-9 text-xs font-mono" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="payment.manual_payment.sender_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Sender {method} Number (যে নম্বর থেকে পাঠিয়েছেন) <span className="text-rose-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="01XXXXXXXXX"
                      {...field}
                      value={field.value || ""}
                      className="h-9 text-xs font-mono"
                      maxLength={14}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment.manual_payment.transaction_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">
                    Transaction ID (TrxID) <span className="text-rose-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. 9K28A19XKL"
                      {...field}
                      value={field.value || ""}
                      className="h-9 text-xs font-mono uppercase"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="payment.manual_payment.notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs">Additional Payment Reference / Note (Optional)</FormLabel>
              <FormControl>
                <Input
                  placeholder="Optional reference, counter number, or notes"
                  {...field}
                  value={field.value || ""}
                  className="h-9 text-xs"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
