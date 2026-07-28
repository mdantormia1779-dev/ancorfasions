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
    const price = item.variant?.sale_price || item.variant?.price || product?.sale_price || product?.base_price || product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-slate-100 p-6 rounded-full mb-6">
          <ShoppingCart className="w-12 h-12 text-slate-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">Your cart is empty</h1>
        <p className="text-slate-500 mb-8 max-w-md">
          Looks like you haven't added anything to your cart yet. Discover our latest collections and find something you love.
        </p>
        <Button size="lg">
          <Link href="/products">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <div className="border-t border-slate-200 divide-y divide-slate-200">
            {items.map(item => (
              <CartItemComponent key={item.id} item={item} />
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-4">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border sticky top-24">
            <h2 className="text-lg font-medium mb-4">Order Summary</h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal ({items.length} items)</span>
                <span className="font-medium">BDT {subtotal.toLocaleString()}</span>
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
            
            <div className="border-t mt-6 pt-6 flex justify-between items-center text-base font-semibold">
              <span>Estimated Total</span>
              <span>BDT {subtotal.toLocaleString()}</span>
            </div>
            
            <Button size="lg" className="w-full mt-6" asChild>
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
            
            <div className="mt-6 flex justify-center text-sm text-slate-500">
              <Link href="/products" className="hover:text-slate-900 font-medium">
                or continue shopping &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
