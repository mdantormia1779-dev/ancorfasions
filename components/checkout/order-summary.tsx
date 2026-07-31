"use client";

import { useCartStore } from "@/stores/use-cart-store";
import { useCheckoutStore } from "@/stores/use-checkout-store";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function OrderSummary() {
  const { cart } = useCartStore();
  const { formData } = useCheckoutStore();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);

  const items = cart?.items || [];

  const subtotal = items.reduce((sum, item) => {
    const price =
      item.variant?.sale_price ||
      item.variant?.price ||
      item.product?.sale_price ||
      item.product?.price ||
      0;
    return sum + price * item.quantity;
  }, 0);

  const shippingMethod = formData.shipping?.shipping_method;
  const shippingFee =
    subtotal > 0 ? (shippingMethod === "home_delivery_outside" ? 150 : 100) : 0;
  const tax = subtotal > 0 ? subtotal * 0.15 : 0; // 15% VAT
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const total = subtotal + shippingFee + tax - discount;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    // Mock coupon logic: 'WELCOME10' gives 10% off
    if (couponCode.toUpperCase() === "WELCOME10") {
      setAppliedCoupon({ code: "WELCOME10", discount: subtotal * 0.1 });
    } else {
      alert("Invalid coupon code");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  return (
    <div className="rounded-lg border bg-slate-50 p-6 dark:bg-slate-900">
      <h2 className="mb-4 text-lg font-medium">Order Summary</h2>

      <div className="mb-6 max-h-[300px] space-y-4 overflow-y-auto pr-2">
        {items.map((item) => {
          const price =
            item.variant?.sale_price ||
            item.variant?.price ||
            item.product?.sale_price ||
            item.product?.price ||
            0;
          const image = item.product?.main_image_url || "/placeholder.png";

          return (
            <div key={item.id} className="flex gap-4">
              <div className="relative h-16 w-16 overflow-hidden rounded-md border bg-white">
                <Image
                  src={image}
                  alt={item.product?.title || ""}
                  fill
                  className="object-cover"
                />
                <div className="absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-slate-500 text-xs text-white">
                  {item.quantity}
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-center">
                <h4 className="line-clamp-2 text-sm font-medium">
                  {item.product?.title}
                </h4>
                {item.variant && (
                  <p className="text-xs text-slate-500">
                    {Object.values(item.variant.attributes).join(", ")}
                  </p>
                )}
              </div>
              <div className="flex items-center text-sm font-medium">
                {formatCurrency(price * item.quantity)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-6 border-t pt-6">
        <h3 className="mb-3 text-sm font-medium">Gift Card or Discount Code</h3>
        {appliedCoupon ? (
          <div className="flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            <span className="font-medium">{appliedCoupon.code}</span>
            <button
              onClick={handleRemoveCoupon}
              className="text-xs underline hover:text-green-900"
            >
              Remove
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Code (Try WELCOME10)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1"
            />
            <Button variant="secondary" onClick={handleApplyCoupon}>
              Apply
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-3 border-t pt-6 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Shipping</span>
          <span className="font-medium">
            {shippingFee > 0 ? formatCurrency(shippingFee) : "Free"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Estimated Tax (15%)</span>
          <span className="font-medium">{formatCurrency(tax)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span className="font-medium">-{formatCurrency(discount)}</span>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t pt-6">
        <span className="text-base font-semibold">Total</span>
        <span className="text-xl font-bold">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
