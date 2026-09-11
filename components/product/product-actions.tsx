"use client";

import { useEffect, useRef } from "react";
import { Heart, Minus, Plus } from "lucide-react";
import { useCartStore } from "@/stores/use-cart-store";
import { useWishlistStore } from "@/stores/use-wishlist-store";
import { useSession } from "@/hooks/use-session";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export interface ProductActionsProps {
  productId: string;
  selectedVariantId?: string | null;
  disabled?: boolean;
  productName?: string;
  productPrice?: number;
  productImage?: string;
  quantity?: number;
  onQuantityChange?: (quantity: number) => void;
  maxQuantity?: number;
  isOutOfStock?: boolean;
  validationError?: string | null;
}

export function ProductActions({
  productId,
  selectedVariantId,
  disabled = false,
  productName,
  productPrice,
  productImage,
  quantity = 1,
  onQuantityChange,
  maxQuantity = 10,
  isOutOfStock = false,
  validationError = null,
}: ProductActionsProps) {
  const { addItem: addCartItem, isLoading: isCartLoading } = useCartStore();
  const {
    addItem: addWishlistItem,
    removeItemByProductId,
    wishlist,
    isLoading: isWishlistLoading,
  } = useWishlistStore();
  const { user } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const actionsRef = useRef<HTMLDivElement>(null);

  const isWished =
    wishlist?.items?.some((item) => item.product_id === productId) || false;

  const handleAddToCart = async () => {
    if (validationError) {
      toast.error(validationError);
      return;
    }
    if (isOutOfStock || disabled || isCartLoading) {
      return;
    }

    try {
      await addCartItem(productId, selectedVariantId || null, quantity);
      const storeState = useCartStore.getState();
      if (storeState.error) {
        toast.error(storeState.error);
      } else {
        toast.success(`Added ${quantity > 1 ? `${quantity}x ` : ""}${productName || "item"} to cart`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add to cart.");
    }
  };

  const handleToggleWishlist = async () => {
    if (!user) {
      toast.info("Please sign in to save items to your wishlist.", {
        action: {
          label: "Sign In",
          onClick: () =>
            router.push(`/auth/login?next=${encodeURIComponent(pathname)}`),
        },
      });
      return;
    }

    try {
      if (isWished) {
        await removeItemByProductId(productId);
        toast.success("Removed from wishlist");
      } else {
        await addWishlistItem(productId, selectedVariantId || null);
        toast.success("Added to wishlist ❤️");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update wishlist.");
    }
  };

  const handleDecrease = () => {
    if (quantity > 1 && onQuantityChange) {
      onQuantityChange(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < maxQuantity && onQuantityChange) {
      onQuantityChange(quantity + 1);
    }
  };

  const effectiveDisabled = isOutOfStock || disabled;

  return (
    <>
      <div ref={actionsRef} className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {/* Quantity Picker */}
        <div
          className={cn(
            "flex h-14 w-full sm:w-36 items-center justify-between border border-gray-200 bg-white transition-opacity",
            effectiveDisabled ? "opacity-50 pointer-events-none" : ""
          )}
          role="group"
          aria-label="Quantity Selector"
        >
          <button
            type="button"
            onClick={handleDecrease}
            disabled={effectiveDisabled || quantity <= 1}
            aria-label="Decrease quantity"
            className="flex h-full w-12 items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span
            className="flex-1 text-center text-sm font-semibold text-zinc-900 select-none"
            aria-live="polite"
          >
            {quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrease}
            disabled={effectiveDisabled || quantity >= maxQuantity}
            aria-label="Increase quantity"
            className="flex h-full w-12 items-center justify-center text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={effectiveDisabled || isCartLoading}
          className={cn(
            "group flex h-14 flex-1 items-center justify-center px-8 text-xs font-bold uppercase tracking-widest text-white transition-all",
            effectiveDisabled
              ? "cursor-not-allowed bg-zinc-300 text-zinc-500"
              : "bg-black hover:bg-zinc-800 active:scale-[0.99]",
            isCartLoading ? "cursor-wait opacity-80" : ""
          )}
        >
          <span>
            {isCartLoading
              ? "Adding..."
              : isOutOfStock
                ? "Out of Stock"
                : "Add to Cart"}
          </span>
        </button>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          disabled={isWishlistLoading}
          aria-label={isWished ? "Remove from wishlist" : "Add to wishlist"}
          className="flex h-14 w-14 shrink-0 items-center justify-center border border-gray-200 transition-colors hover:border-black"
        >
          <Heart
            className={cn(
              "h-5 w-5 transition-transform hover:scale-110 text-black",
              isWished && "fill-black"
            )}
            strokeWidth={1.5}
          />
        </button>
      </div>

      {/* Sticky Mobile Add to Cart */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 transform border-t border-gray-100 bg-white px-4 py-3 shadow-lg transition-transform duration-300 md:hidden",
          "pb-[max(env(safe-area-inset-bottom),0.75rem)]"
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 overflow-hidden">
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
            <div className="flex flex-col min-w-0">
              <span className="truncate text-xs font-medium text-gray-900">
                {productName}
              </span>
              {productPrice !== undefined && (
                <span className="text-[11px] font-semibold text-gray-900">
                  {formatCurrency(productPrice)}
                </span>
              )}
            </div>
          </div>
          <button
            type="button"
            className={cn(
              "flex h-11 shrink-0 items-center justify-center px-6 text-[10px] font-bold uppercase tracking-widest text-white transition-colors",
              effectiveDisabled
                ? "cursor-not-allowed bg-zinc-300 text-zinc-500"
                : "bg-black hover:bg-zinc-800",
              isCartLoading ? "cursor-wait opacity-80" : ""
            )}
            onClick={handleAddToCart}
            disabled={effectiveDisabled || isCartLoading}
          >
            {isCartLoading
              ? "Adding..."
              : isOutOfStock
                ? "Out of Stock"
                : "Add to Cart"}
          </button>
        </div>
      </div>
    </>
  );
}
