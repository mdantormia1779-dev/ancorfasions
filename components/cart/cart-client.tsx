"use client";

import { useEffect } from "react";
import { CartItem as CartItemComponent } from "@/components/cart/cart-item";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/stores/use-cart-store";
import { Cart } from "@/types/checkout.types";

interface CartClientProps {
  initialCart: Cart | null;
}

export function CartClient({ initialCart }: CartClientProps) {
  const { cart, fetchCart } = useCartStore();

  // Use store cart if available, otherwise use initial server-fetched cart
  const currentCart = cart || initialCart;
  const items = currentCart?.items || [];

  // Fetch cart on mount to sync any cross-tab changes
  useEffect(() => {
    if (!cart) {
      fetchCart();
    }
  }, [cart, fetchCart]);

  const subtotal = items.reduce((sum, item) => {
    const product = item.product as any;
    const price =
      item.variant?.sale_price ||
      item.variant?.price ||
      product?.sale_price ||
      product?.base_price ||
      product?.price ||
      0;
    return sum + price * item.quantity;
  }, 0);

  if (items.length === 0) {
    return (
      <div className="container mx-auto flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
        <div className="mb-6 rounded-full bg-slate-100 p-6">
          <ShoppingCart className="h-12 w-12 text-slate-400" />
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight">
          Your cart is empty
        </h1>
        <p className="mb-8 max-w-md text-slate-500">
          Looks like you haven't added anything to your cart yet. Discover our
          latest collections and find something you love.
        </p>
        <Button size="lg">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">Shopping Cart</h1>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <div className="divide-y divide-slate-200 border-t border-slate-200">
            {items.map((item) => (
              <CartItemComponent key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-24 rounded-lg border bg-slate-50 p-6 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-medium">Order Summary</h2>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Subtotal ({items.length} items)
                </span>
                <span className="font-medium">
                  BDT {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Shipping estimate</span>
                <span>Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tax estimate</span>
                <span>Calculated at checkout</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t pt-6 text-base font-semibold">
              <span>Estimated Total</span>
              <span>BDT {subtotal.toLocaleString()}</span>
            </div>

            <Button size="lg" className="mt-6 w-full" asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>

            <div className="mt-6 flex justify-center text-sm text-slate-500">
              <Link
                href="/products"
                className="font-medium hover:text-slate-900"
              >
                or continue shopping &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
