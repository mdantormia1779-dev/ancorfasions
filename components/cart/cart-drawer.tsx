"use client";

import { useCartStore } from "@/stores/use-cart-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartItem } from "./cart-item";
import { useRouter } from "next/navigation";
import { ShoppingBag, Loader2, ArrowRight } from "lucide-react";
import Image from "next/image";
import { ProductCard } from "@/components/product/product-card";
import { usePersonalizationStore } from "@/stores/use-personalization-store";

export function CartDrawer() {
  const { cart, isSheetOpen, setSheetOpen, isLoading } = useCartStore();
  const router = useRouter();

  const handleCheckout = () => {
    setSheetOpen(false);
    router.push("/checkout");
  };

  const itemCount =
    cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal =
    cart?.items?.reduce((sum, item) => {
      const product = item.product as any;
      const price =
        item.variant?.sale_price ||
        item.variant?.price ||
        product?.sale_price ||
        product?.base_price ||
        product?.price ||
        0;
      return sum + price * item.quantity;
    }, 0) || 0;

  const FREE_SHIPPING_THRESHOLD = 999;
  const progress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const amountNeeded = FREE_SHIPPING_THRESHOLD - subtotal;
  
  const { recentlyViewed } = usePersonalizationStore();
  const upsells = recentlyViewed.filter(p => !cart?.items?.some(item => item.product_id === p.id)).slice(0, 2);

  return (
    <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Your Cart ({itemCount})
          </SheetTitle>
          <SheetDescription>
            Review your items and proceed to checkout.
          </SheetDescription>
        </SheetHeader>

        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        <div className="mt-4 flex-1 overflow-hidden">
          {!cart || !cart.items || cart.items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-6 text-center px-4">
              <div className="relative h-40 w-40 opacity-80 mix-blend-multiply">
                <Image src="https://images.unsplash.com/photo-1555529771-835f59bfc50c?w=400&q=80" alt="Empty Cart" fill sizes="160px" className="object-cover rounded-full grayscale" />
              </div>
              <div>
                <h3 className="text-xl font-light text-[#1A1A1A]">Your cart is empty</h3>
                <p className="mt-2 text-sm text-gray-500">Discover our latest arrivals and elevate your wardrobe.</p>
              </div>
              <Button onClick={() => setSheetOpen(false)} className="mt-4 bg-[#1A1A1A] px-10 py-6 text-xs font-bold uppercase tracking-widest text-white hover:bg-black">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              {/* Free Shipping Progress */}
              <div className="mb-4 bg-gray-50 p-4 rounded-lg">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-[#1A1A1A]">
                  <span>
                    {amountNeeded > 0 
                      ? `You're only ৳${amountNeeded.toLocaleString()} away from Free Shipping` 
                      : "🎉 You've unlocked Free Shipping!"}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <div 
                    className="h-full bg-[#1A1A1A] transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }} 
                  />
                </div>
              </div>

              <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4">
                  {cart.items.map((item) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
                
                {/* Upsells */}
                {upsells.length > 0 && (
                  <div className="mt-10 border-t border-gray-100 pt-6">
                    <h4 className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#1A1A1A]">
                      Complete Your Look
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      {upsells.map((upsell) => (
                        <div key={upsell.id} className="group relative flex flex-col gap-2">
                           <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                             <Image src={upsell.product_media?.[0]?.url || "/images/placeholder.webp"} alt={upsell.name} fill sizes="(max-width: 768px) 50vw, 200px" className="object-cover" />
                           </div>
                           <p className="truncate text-xs font-medium">{upsell.name}</p>
                           <p className="text-[10px] text-gray-500">৳{upsell.base_price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          )}
        </div>

        {cart && cart.items && cart.items.length > 0 && (
          <div className="mt-auto space-y-4 border-t pt-4 bg-white z-10 relative">
            <div className="flex items-center justify-between font-medium text-[#1A1A1A]">
              <span>Subtotal</span>
              <span>BDT {subtotal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500">
              Shipping & taxes calculated at checkout.
            </p>
            <div className="space-y-2">
              <Button className="w-full bg-[#1A1A1A] h-12 text-xs font-bold uppercase tracking-widest text-white hover:bg-black" onClick={handleCheckout}>
                Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 text-xs font-semibold uppercase tracking-widest text-gray-500 hover:text-black"
                onClick={() => {
                  setSheetOpen(false);
                  router.push("/cart");
                }}
              >
                View Cart
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
