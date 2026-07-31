"use client";

import { useState } from "react";
import { ShoppingBag, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/use-cart-store";
import { useWishlistStore } from "@/stores/use-wishlist-store";
import { cn } from "@/lib/utils";

interface ProductActionsProps {
  productId: string;
  selectedVariantId?: string;
  disabled?: boolean;
}

export function ProductActions({
  productId,
  selectedVariantId,
  disabled,
}: ProductActionsProps) {
  const { addItem: addCartItem, isLoading: isCartLoading } = useCartStore();
  const {
    addItem: addWishlistItem,
    removeItemByProductId,
    wishlist,
    isLoading: isWishlistLoading,
  } = useWishlistStore();
  const [quantity, setQuantity] = useState(1);

  const isWished =
    wishlist?.items?.some((item) => item.product_id === productId) || false;

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

  return (
    <div className="flex gap-4">
      <Button
        className="h-14 flex-1 bg-black text-base font-bold uppercase tracking-wide hover:bg-zinc-800"
        onClick={handleAddToCart}
        disabled={disabled || isCartLoading}
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        {isCartLoading ? "Adding..." : "Add to Cart"}
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="h-14 w-14 shrink-0"
        onClick={handleToggleWishlist}
        disabled={isWishlistLoading}
      >
        <Heart
          className={cn("h-5 w-5", isWished && "fill-primary text-primary")}
        />
      </Button>
      <Button variant="outline" size="icon" className="h-14 w-14 shrink-0">
        <Share2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
