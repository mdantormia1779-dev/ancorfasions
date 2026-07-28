'use client';

import { useCartStore } from '@/stores/use-cart-store';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

export function OrderSummary() {
  const { cart } = useCartStore();

  const items = cart?.items || [];
  
  const subtotal = items.reduce((sum, item) => {
    const price = item.variant?.sale_price || item.variant?.price || item.product?.sale_price || item.product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  const shippingFee = subtotal > 0 ? 100 : 0; // Hardcoded shipping rule for now
  const discount = 0;
  const total = subtotal + shippingFee - discount;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 border">
      <h2 className="text-lg font-medium mb-4">Order Summary</h2>
      
      <div className="space-y-4 max-h-[300px] overflow-y-auto mb-6 pr-2">
        {items.map(item => {
          const price = item.variant?.sale_price || item.variant?.price || item.product?.sale_price || item.product?.price || 0;
          const image = item.product?.main_image_url || '/placeholder.png';
          
          return (
            <div key={item.id} className="flex gap-4">
              <div className="relative w-16 h-16 bg-white rounded-md overflow-hidden border">
                <Image src={image} alt={item.product?.title || ''} fill className="object-cover" />
                <div className="absolute -top-2 -right-2 bg-slate-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center z-10">
                  {item.quantity}
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h4 className="text-sm font-medium line-clamp-2">{item.product?.title}</h4>
                {item.variant && (
                  <p className="text-xs text-slate-500">
                    {Object.values(item.variant.attributes).join(', ')}
                  </p>
                )}
              </div>
              <div className="text-sm font-medium flex items-center">
                {formatCurrency(price * item.quantity)}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="space-y-3 pt-6 border-t text-sm">
        <div className="flex justify-between">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Shipping</span>
          <span className="font-medium">{shippingFee > 0 ? formatCurrency(shippingFee) : 'Free'}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Discount</span>
            <span className="font-medium">-{formatCurrency(discount)}</span>
          </div>
        )}
      </div>
      
      <div className="pt-6 mt-6 border-t flex justify-between items-center">
        <span className="text-base font-semibold">Total</span>
        <span className="text-xl font-bold">{formatCurrency(total)}</span>
      </div>
    </div>
  );
}
