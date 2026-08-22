"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Zap,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, KeyboardEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  brands?: { name: string } | null;
  product_media?: { url: string; is_primary: boolean }[];
}

export function BrandedCollection({ 
  products,
  title = "Womens Collection",
  subtitle = "Womens",
  viewAllLink = "/products"
}: { 
  products: Product[];
  title?: string;
  subtitle?: string;
  viewAllLink?: string;
}) {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());

  const toggleWishlist = (e: React.MouseEvent, productId: string, productName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
        toast.success("Removed from Wishlist");
      } else {
        next.add(productId);
        toast.success(`${productName} added to Wishlist! ❤️`);
      }
      return next;
    });
  };
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        scrollPrev();
      } else if (e.key === "ArrowRight") {
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  // Use a fallback to ensure we show something in dev if DB is empty
  const placeholders = [
    "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=500&q=80",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&q=80",
    "https://images.unsplash.com/photo-1596455607563-ad6193f76b11?w=500&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80",
    "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=500&q=80",
  ];

  // Fill with dummy products if needed
  const displayProducts = products && products.length > 0 ? products : [];
  const dummyProducts: Product[] = Array.from({
    length: Math.max(0, 8 - displayProducts.length),
  }).map((_, i) => ({
    id: `dummy-${i}`,
    name: "Classic Collection Item",
    slug: "classic-item",
    base_price: 3999,
    brands: { name: "Anchor Exclusive" },
  }));

  const finalProducts = [...displayProducts, ...dummyProducts].slice(0, 8);

  return (
    <section className="relative bg-white py-16">
      <div className="container px-4 md:px-6">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              {subtitle}
            </span>
            <h2 className="font-serif text-3xl text-gray-900 md:text-4xl">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={viewAllLink}
              className="group flex hidden items-center text-sm font-medium text-gray-900 transition-colors hover:text-primary md:flex"
            >
              View All Products
              <ArrowRight
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                strokeWidth={2.5}
              />
            </Link>
          </div>
        </div>

        {/* Embla Carousel Viewport */}
        <div
          className="group/carousel relative outline-none"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div className="-mx-4 overflow-hidden px-4" ref={emblaRef}>
            <div className="flex gap-6 py-2">
              {finalProducts.map((product, index) => {
                const primaryMedia =
                  product.product_media?.find((m) => m.is_primary) ||
                  product.product_media?.[0];
                const secondaryMedia = product.product_media?.filter(
                  (m) => !m.is_primary
                )?.[0];

                const imageUrl =
                  primaryMedia?.url ||
                  placeholders[index % placeholders.length];
                const secondaryImageUrl =
                  secondaryMedia?.url ||
                  placeholders[(index + 1) % placeholders.length];
                const brandName = product.brands?.name || "Unknown Brand";

                return (
                  <div
                    key={product.id}
                    className="group flex flex-[0_0_45%] cursor-pointer flex-col sm:flex-[0_0_33.33%] md:flex-[0_0_25%] lg:flex-[0_0_20%]"
                  >
                    <div className="relative mb-4 aspect-[4/5] w-full overflow-hidden bg-[#F7F7F7] transition-all duration-500">
                      <Link
                        href={`/product/${product.slug}`}
                        className="block h-full w-full"
                      >
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 70vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 20vw"
                          className="object-cover object-top opacity-100 transition-all duration-700 group-hover:scale-105 group-hover:opacity-0"
                        />
                        <Image
                          src={secondaryImageUrl}
                          alt={`${product.name} Alternate`}
                          fill
                          sizes="(max-width: 640px) 70vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, 20vw"
                          className="absolute inset-0 object-cover object-top opacity-0 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                        />
                      </Link>

                      {/* Dual Icon Action Bar */}
                      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 flex translate-y-full transition-transform duration-500 ease-out group-hover:pointer-events-auto group-hover:translate-y-0">
                        <button
                          onClick={(e) => { e.preventDefault(); toast.success(`${product.name} added to cart!`); }}
                          className="flex flex-1 items-center justify-center gap-2 bg-black/90 py-3.5 text-white backdrop-blur-md transition-all duration-200 hover:bg-[#C9A86A]"
                          title="Add to Cart"
                        >
                          <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
                          <span className="text-[10px] font-semibold uppercase tracking-widest">Cart</span>
                        </button>
                        <div className="w-px bg-white/20" />
                        <button
                          onClick={(e) => { e.preventDefault(); router.push(`/product/${product.slug}`); }}
                          className="flex flex-1 items-center justify-center gap-2 bg-black/90 py-3.5 text-white backdrop-blur-md transition-all duration-200 hover:bg-[#1A1A1A]"
                          title="Order Now"
                        >
                          <Zap className="h-4 w-4" strokeWidth={1.5} />
                          <span className="text-[10px] font-semibold uppercase tracking-widest">Buy</span>
                        </button>
                      </div>

                      {/* Wishlist Heart */}
                      <button
                        onClick={(e) => toggleWishlist(e, product.id, product.name)}
                        className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 opacity-0 shadow-sm backdrop-blur-sm transition-all duration-300 hover:scale-110 group-hover:opacity-100"
                      >
                        <Heart
                          className={`h-4 w-4 transition-colors duration-200 ${wishlist.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                          strokeWidth={1.5}
                        />
                      </button>
                    </div>

                    <Link
                      href={`/product/${product.slug}`}
                      className="flex flex-col text-center"
                    >
                      <span className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                        {brandName}
                      </span>
                      <h3 className="mb-2 truncate text-sm font-medium text-gray-900 transition-colors group-hover:text-black">
                        {product.name}
                      </h3>
                      <div className="mt-1 flex flex-col items-center justify-center gap-1.5">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(product.base_price)}
                        </span>
                        {/* Dummy Color Swatches */}
                        <div className="flex gap-1.5">
                          <div className="h-2.5 w-2.5 rounded-full border border-gray-200 bg-[#1e293b]"></div>
                          <div className="h-2.5 w-2.5 rounded-full border border-gray-200 bg-[#d6c5b3]"></div>
                          <div className="h-2.5 w-2.5 rounded-full border border-gray-200 bg-[#8c9ca7]"></div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Controls */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-[40%] z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-600 opacity-0 shadow-lg transition-all hover:scale-110 hover:text-primary disabled:opacity-0 group-hover/carousel:opacity-100 md:-left-4"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-[40%] z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-600 opacity-0 shadow-lg transition-all hover:scale-110 hover:text-primary disabled:opacity-0 group-hover/carousel:opacity-100 md:-right-4"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </div>

        {/* Mobile View All Link */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href={viewAllLink}
            className="group flex items-center text-sm font-medium text-gray-900 transition-colors hover:text-primary"
          >
            View All Products
            <ArrowRight
              className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
              strokeWidth={2.5}
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
