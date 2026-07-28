'use client';

import { useCartStore } from '@/stores/use-cart-store';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CartItem } from './cart-item';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Loader2 } from 'lucide-react';

export function CartDrawer() {
  const { cart, isSheetOpen, setSheetOpen, isLoading } = useCartStore();
  const router = useRouter();

  const handleCheckout = () => {
    setSheetOpen(false);
    router.push('/checkout');
  };

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const subtotal = cart?.items?.reduce((sum, item) => {
    const product = item.product as any;
    const price = item.variant?.sale_price || item.variant?.price || product?.sale_price || product?.base_price || product?.price || 0;
    return sum + (price * item.quantity);
  }, 0) || 0;

  return (
    <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Your Cart ({itemCount})
          </SheetTitle>
          <SheetDescription>
            Review your items and proceed to checkout.
          </SheetDescription>
        </SheetHeader>

        {isLoading && (
          <div className="absolute inset-0 bg-background/50 z-10 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        <div className="flex-1 overflow-hidden mt-4">
          {!cart || !cart.items || cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
              <ShoppingBag className="w-12 h-12 opacity-20" />
              <p>Your cart is empty.</p>
              <Button variant="outline" onClick={() => setSheetOpen(false)}>Continue Shopping</Button>
            </div>
          ) : (
            <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                {cart.items.map(item => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {cart && cart.items && cart.items.length > 0 && (
          <div className="pt-4 border-t space-y-4 mt-auto">
            <div className="flex items-center justify-between font-medium">
              <span>Subtotal</span>
              <span>BDT {subtotal.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Shipping and taxes calculated at checkout.
            </p>
            <div className="space-y-2">
              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
              <Button variant="outline" className="w-full" onClick={() => {
                setSheetOpen(false);
                router.push('/cart');
              }}>
                View Cart
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
