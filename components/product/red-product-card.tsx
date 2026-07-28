"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { Jost } from "next/font/google";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export function RedProductCard({ product }: { product: any }) {
  const imageSrc = product.images?.[0]?.url || product.product_media?.[0]?.url || "/images/placeholder.webp";
  const slug = product.slug || product.id;
  const price = product.base_price ?? product.price ?? 0;
  const comparePrice = product.compare_at_price ?? product.compareAtPrice;
  const discountPct = comparePrice && comparePrice > price
    ? Math.round(((comparePrice - price) / comparePrice) * 100)
    : null;

  return (
    <div className={`${jost.className} group relative w-full overflow-hidden bg-white border border-gray-100 hover:border-[#C9A86A]/30 hover:shadow-xl transition-all duration-500`}>
      
      {/* Image Container */}
      <div className="relative w-full h-[300px] md:h-[400px] overflow-hidden bg-[#F8F7F4]">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Discount Badge */}
        {discountPct && (
          <div className="absolute top-3 left-3 bg-[#C9A86A] text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 z-10">
            -{discountPct}%
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            toast.success(`${product.name} added to Wishlist!`);
          }}
          className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all duration-300"
          aria-label="Add to Wishlist"
        >
          <Heart className="w-4 h-4" strokeWidth={1.5} />
        </button>

        {/* Slide-up Action */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-10">
          <button
            onClick={() => toast.success(`${product.name} added to cart!`)}
            className="w-full bg-[#1A1A1A] hover:bg-[#C9A86A] text-white text-[10px] font-bold tracking-[0.3em] uppercase py-4 flex items-center justify-center gap-2 transition-colors duration-300"
          >
            <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
            Add to Cart
          </button>
        </div>
      </div>

      {/* Product Info */}
      <Link href={`/product/${slug}`} className="block p-4">
        <h3 className="text-sm font-medium text-[#1A1A1A] line-clamp-1 group-hover:text-[#C9A86A] transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-sm font-semibold text-[#1A1A1A]">{formatCurrency(price)}</span>
          {comparePrice && comparePrice > price && (
            <span className="text-xs text-gray-400 line-through">{formatCurrency(comparePrice)}</span>
          )}
        </div>
      </Link>
    </div>
  );
}
