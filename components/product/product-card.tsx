"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWishlistStore } from "@/stores/use-wishlist-store";
import { useCartStore } from "@/stores/use-cart-store";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: any;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { wishlist, addItem: addWishlistItem, removeItemByProductId } = useWishlistStore();
  const { addItem: addCartItem } = useCartStore();
  
  const primaryImage = product.product_media?.find((img: any) => img.is_primary)?.url 
    || product.product_media?.[0]?.url 
    || "/images/placeholder.webp"; // Fallback image

  const isWished = wishlist?.items?.some((item) => item.product_id === product.id) || false;

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (isWished) {
      await removeItemByProductId(product.id);
    } else {
      await addWishlistItem(product.id);
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    await addCartItem(product.id, null, 1);
  };

  return (
    <div className={cn("group relative flex flex-col gap-3 rounded-lg border bg-card p-4 transition-all hover:shadow-md", className)}>
      <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
        <Link href={`/products/${product.slug}`} className="block h-full w-full">
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {product.status === 'NEW' && <Badge variant="default">New</Badge>}
          {product.discount > 0 && <Badge variant="destructive">-{product.discount}%</Badge>}
        </div>

        {/* Quick Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button 
            variant="secondary" 
            size="icon" 
            className="h-8 w-8 rounded-full shadow-sm"
            onClick={handleToggleWishlist}
          >
            <Heart className={cn("h-4 w-4", isWished && "fill-primary text-primary")} />
            <span className="sr-only">Wishlist</span>
          </Button>
        </div>
        
        <div className="absolute bottom-2 left-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button variant="default" className="w-full h-9 shadow-sm" onClick={handleQuickAdd}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Quick Add
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            {product.brands?.name && (
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{product.brands.name}</p>
            )}
            <Link href={`/products/${product.slug}`}>
              <h3 className="font-medium leading-tight line-clamp-2 hover:text-primary transition-colors">
                {product.name}
              </h3>
            </Link>
          </div>
          <div className="text-right">
            <p className="font-semibold">${Number(product.base_price).toFixed(2)}</p>
          </div>
        </div>
        
        {product.average_rating > 0 && (
          <div className="flex items-center gap-1 mt-auto pt-2">
            <div className="flex items-center text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={cn("w-3 h-3", i < Math.floor(product.average_rating) ? "fill-current" : "fill-muted text-muted")}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-muted-foreground ml-1">({product.average_rating})</span>
          </div>
        )}
      </div>
    </div>
  );
}
