import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="group relative flex flex-col gap-2">
      <div className="relative aspect-[3/4] overflow-hidden bg-zinc-100">
        <Link
          href={`/product/${product.slug}`}
          className="absolute inset-0 z-10"
        >
          <span className="sr-only">View {product.name}</span>
        </Link>
        <Image
          src={product.thumbnail || "https://placehold.co/600x800/eaeaea/black?text=No+Image"}
          alt={product.name}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* Badges */}
        <div className="absolute left-2 top-2 z-20 flex flex-col gap-1">
          {product.isNew && (
            <span className="bg-black px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              New
            </span>
          )}
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="bg-destructive px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-destructive-foreground">
              Sale
            </span>
          )}
        </div>

        {/* Hover Actions */}
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full shadow-md hover:bg-black hover:text-white"
          >
            <Heart className="h-4 w-4" />
            <span className="sr-only">Add to wishlist</span>
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-10 w-10 rounded-full shadow-md hover:bg-black hover:text-white"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="sr-only">Add to cart</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col pt-2">
        <h3 className="text-sm font-medium text-zinc-900 decoration-1 underline-offset-4 group-hover:underline">
          <Link href={`/product/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold">
            {formatPrice(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-zinc-500 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
