"use client";

import { useState, useEffect, useRef } from "react";
import { Heart, Share2, Plus } from "lucide-react";
import { useCartStore } from "@/stores/use-cart-store";
import { useWishlistStore } from "@/stores/use-wishlist-store";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

interface ProductActionsProps {
  productId: string;
  selectedVariantId?: string;
  disabled?: boolean;
  productName?: string;
  productPrice?: number;
  productImage?: string;
}

export function ProductActions({
  productId,
  selectedVariantId,
  disabled,
  productName,
  productPrice,
  productImage,
}: ProductActionsProps) {
  const { addItem: addCartItem, isLoading: isCartLoading } = useCartStore();
  const {
    addItem: addWishlistItem,
    removeItemByProductId,
    wishlist,
    isLoading: isWishlistLoading,
  } = useWishlistStore();
  const [quantity, setQuantity] = useState(1);
  const [isVisible, setIsVisible] = useState(true);
  const actionsRef = useRef<HTMLDivElement>(null);

  const isWished =
    wishlist?.items?.some((item) => item.product_id === productId) || false;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: "0px", threshold: 0.1 }
    );

    if (actionsRef.current) {
      observer.observe(actionsRef.current);
    }

    return () => {
      if (actionsRef.current) {
        observer.unobserve(actionsRef.current);
      }
    };
  }, []);

  const handleAddToCart = async () => {
    if (disabled) return;
    await addCartItem(productId, selectedVariantId || null, quantity);
  };

  const handleToggleWishlist = async () => {
    if (isWished) {
      await removeItemByProductId(productId);
    } else {
      await addWishlistItem(productId, selectedVariantId || null);
    }
  };

  const formatPrice = (price: number) => {
    return formatCurrency(price);
  };

  return (
    <>
      <div ref={actionsRef} className="flex gap-4">
        <button
          className={cn(
            "group flex h-14 flex-1 items-center justify-center bg-black text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-zinc-800",
            disabled || isCartLoading ? "cursor-not-allowed opacity-50" : ""
          )}
          onClick={handleAddToCart}
          disabled={disabled || isCartLoading}
        >
          <span className="transition-transform group-hover:-translate-y-0.5">
            {isCartLoading ? "Adding..." : "Add to Cart"}
          </span>
        </button>
        <button
          className="flex h-14 w-14 shrink-0 items-center justify-center border border-gray-200 transition-colors hover:border-black"
          onClick={handleToggleWishlist}
          disabled={isWishlistLoading}
        >
          <Heart
            className={cn("h-5 w-5 transition-transform hover:scale-110 text-black", isWished && "fill-black")}
            strokeWidth={1.5}
          />
        </button>
      </div>

      {/* Sticky Mobile Add to Cart */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 transform border-t border-gray-100 bg-white px-4 py-3 shadow-lg transition-transform duration-300 md:hidden",
          isVisible ? "translate-y-full" : "translate-y-0 pb-[max(env(safe-area-inset-bottom),0.75rem)]"
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {productImage && (
              <div className="relative h-12 w-10 shrink-0 overflow-hidden bg-gray-100">
                <Image
                  src={productImage}
                  alt={productName || "Product"}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>
            )}
            <div className="flex flex-col">
              <span className="truncate text-xs font-medium text-gray-900">
                {productName}
              </span>
              {productPrice && (
                <span className="text-[10px] text-gray-500">
                  {formatPrice(productPrice)}
                </span>
              )}
            </div>
          </div>
          <button
            className={cn(
              "flex h-10 shrink-0 items-center justify-center bg-black px-6 text-[10px] font-bold uppercase tracking-widest text-white transition-colors hover:bg-zinc-800",
              disabled || isCartLoading ? "cursor-not-allowed opacity-50" : ""
            )}
            onClick={handleAddToCart}
            disabled={disabled || isCartLoading}
          >
            {isCartLoading ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </>
  );
}
