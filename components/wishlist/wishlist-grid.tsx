'use client';

import { useWishlistStore } from '@/stores/use-wishlist-store';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Trash2, Heart } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useEffect } from 'react';

export function WishlistGrid() {
  const { wishlist, fetchWishlist, removeItem, moveToCart, isLoading } = useWishlistStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  if (isLoading && (!wishlist || !wishlist.items)) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col space-y-3 animate-pulse">
            <div className="bg-slate-200 dark:bg-slate-800 h-64 rounded-xl" />
            <div className="bg-slate-200 dark:bg-slate-800 h-4 w-2/3" />
            <div className="bg-slate-200 dark:bg-slate-800 h-4 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  const items = wishlist?.items || [];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center border rounded-xl border-dashed">
        <Heart className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
        <p className="text-slate-500 mb-6">Save items you love and buy them later.</p>
        <Button>
          <Link href="/products">Explore Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {items.map(item => {
        const product = item.product as any;
        const title = product?.name || product?.title || 'Unknown Product';
        const price = product?.base_price || product?.price || 0;
        const image = product?.product_media?.find((m: any) => m.is_primary)?.url || 
                      product?.product_media?.[0]?.url || 
                      product?.main_image_url ||
                      '/images/placeholder.webp';
        const slug = product?.slug || '#';

        return (
          <div key={item.id} className="group relative border rounded-xl p-4 transition-shadow hover:shadow-lg bg-white dark:bg-slate-950">
            <div className="relative aspect-square mb-4 overflow-hidden rounded-md bg-slate-100">
              <Image 
                src={image}
                alt={title}
                fill
                className="object-cover transition-transform group-hover:scale-105"
              />
              <button 
                onClick={() => removeItem(item.id)}
                className="absolute top-2 right-2 p-2 bg-white/80 dark:bg-black/50 rounded-full hover:text-rose-500 transition-colors"
                title="Remove from Wishlist"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-1 mb-4">
              <Link href={`/product/${slug}`} className="font-medium hover:underline line-clamp-1">
                {title}
              </Link>
              <p className="text-sm font-semibold">{formatCurrency(price)}</p>
            </div>
            
            <Button 
              className="w-full" 
              onClick={() => moveToCart(item.id, item.product_id)}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Move to Cart
            </Button>
          </div>
        );
      })}
    </div>
  );
}
