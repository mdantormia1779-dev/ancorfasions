"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart } from "lucide-react";
import { Jost } from "next/font/google";
import { useWishlistStore } from "@/stores/use-wishlist-store";
import { useCartStore } from "@/stores/use-cart-store";
import { useSession } from "@/hooks/use-session";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500"] });

interface ProductCardProps {
  product: any;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const {
    wishlist,
    addItem: addWishlistItem,
    removeItemByProductId,
  } = useWishlistStore();
  const { addItem: addCartItem } = useCartStore();
  const { user } = useSession();
  const router = useRouter();

  const primaryImage =
    product.product_media?.find((img: any) => img.is_primary)?.url ||
    product.product_media?.[0]?.url ||
    "/images/placeholder.webp";

  const isWished =
    wishlist?.items?.some((item) => item.product_id === product.id) || false;

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Auth gate: redirect to login if not signed in
    if (!user) {
      toast.info("Please sign in to save items to your wishlist.", {
        action: {
          label: "Sign In",
          onClick: () =>
            router.push(
              `/auth/login?next=${encodeURIComponent(`/product/${product.slug}`)}`
            ),
        },
      });
      return;
    }

    if (isWished) {
      await removeItemByProductId(product.id);
      toast.success("Removed from wishlist");
    } else {
      await addWishlistItem(product.id);
      toast.success("Added to wishlist ❤️");
    }
  };

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    await addCartItem(product.id, null, 1);
  };

  return (
    <div
      className={cn(
        `${jost.className} group relative flex flex-col gap-4 bg-white transition-all`,
        className
      )}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-[#F7F7F7]">
        <Link
          href={`/product/${product.slug}`}
          className="block h-full w-full"
        >
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </Link>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {product.status === "NEW" && (
            <span className="border border-black bg-white px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-black shadow-sm">
              New
            </span>
          )}
          {product.average_rating > 4.5 && (
            <span className="bg-[#C9A86A] px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm">
              Best Seller
            </span>
          )}
          {product.discount > 0 && (
            <span className="border border-black bg-black px-2 py-1 text-[9px] font-bold uppercase tracking-widest text-white shadow-sm">
              -{product.discount}%
            </span>
          )}
        </div>

        {/* Wishlist Action */}
        <div className="absolute right-3 top-3 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
          <button
            onClick={handleToggleWishlist}
            className="flex h-8 w-8 items-center justify-center bg-white shadow-sm transition-transform hover:scale-110"
          >
            <Heart
              className={cn("h-4 w-4 text-black", isWished && "fill-black")}
              strokeWidth={1.5}
            />
            <span className="sr-only">Wishlist</span>
          </button>
        </div>

        {/* Quick Add Bar */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 flex translate-y-full justify-center transition-transform duration-500 ease-out group-hover:pointer-events-auto group-hover:translate-y-0">
          <button
            onClick={handleQuickAdd}
            className="flex w-full items-center justify-center gap-2 bg-black/90 py-3 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md transition-colors hover:bg-black"
          >
            Add To Cart
          </button>
        </div>
      </div>

      <div className="flex flex-col text-center">
        {product.brands?.name && (
          <span className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
            {product.brands.name}
          </span>
        )}
        <Link href={`/product/${product.slug}`}>
          <h3 className="mb-2 truncate text-sm font-medium text-gray-900 transition-colors group-hover:text-black">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center justify-center">
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(product.base_price || 0)}
          </span>
        </div>
      </div>
    </div>
  );
}
