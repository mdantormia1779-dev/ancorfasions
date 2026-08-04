"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useCartStore } from "@/stores/use-cart-store";
import { cn } from "@/lib/utils";

interface FloatingPurchaseCardProps {
  productId: string;
  productName: string;
  productPrice: number;
  productImage: string;
  variants: any[];
}

export function FloatingPurchaseCard({
  productId,
  productName,
  productPrice,
  productImage,
  variants,
}: FloatingPurchaseCardProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { addItem, isLoading } = useCartStore();

  useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down a bit (past the main add to cart)
      if (window.scrollY > 800) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleAddToCart = async () => {
    // Assuming adding default variant if simple, or just a base action
    const defaultVariant = variants?.[0]?.id || null;
    await addItem(productId, defaultVariant, 1);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed left-0 right-0 top-0 z-50 hidden border-b border-gray-100 bg-white/90 px-6 py-3 shadow-sm backdrop-blur-md transition-transform duration-300 animate-in slide-in-from-top-full lg:block">
      <div className="container mx-auto flex max-w-6xl items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-12 w-10 overflow-hidden bg-gray-100">
            <Image
              src={productImage}
              alt={productName}
              fill
              sizes="40px"
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[#1A1A1A]">{productName}</h3>
            <p className="text-xs text-gray-500">{formatPrice(productPrice)}</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <p className="text-xs text-gray-500">
            {variants?.length > 0 ? "Select Size in Cart" : "One Size"}
          </p>
          <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className={cn(
              "bg-[#1A1A1A] px-8 py-3 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-black",
              isLoading && "cursor-not-allowed opacity-50"
            )}
          >
            {isLoading ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
