"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  ShoppingBag,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback } from "react";
import { formatCurrency } from "@/lib/utils";
import { Jost } from "next/font/google";
import { toast } from "sonner";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500"] });

export function TrendingProducts({ products }: { products: any[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      loop: true,
      dragFree: false,
    },
    [Autoplay({ delay: 5000, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  if (!products || products.length === 0) return null;

  const placeholders = [
    "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=500&q=80",
    "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=500&q=80",
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80",
    "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=500&q=80",
    "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500&q=80",
  ];

  return (
    <section className="bg-white py-16 md:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-16 flex flex-col items-start justify-between gap-4 border-b border-gray-100 pb-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2
              className={`${jost.className} mb-3 text-3xl font-light tracking-tight text-[#1A1A1A] md:text-5xl`}
            >
              Trending Now
            </h2>
            <p className="text-sm tracking-wide text-gray-500">
              Discover the pieces our community can't get enough of.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/products?sort=rating"
              className="group mr-4 flex hidden items-center text-xs font-bold uppercase tracking-[0.2em] text-[#1A1A1A] transition-colors hover:text-[#C9A86A] md:flex"
            >
              View All
              <ArrowRight
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                strokeWidth={1.5}
              />
            </Link>
          </div>
        </div>

        <div className="group/carousel relative">
          <div className="-mx-4 overflow-hidden px-4" ref={emblaRef}>
            <div className="flex gap-4 py-4">
              {products.map((product, index) => {
                const primaryMedia =
                  product.product_media?.find((m: any) => m.is_primary) ||
                  product.product_media?.[0];
                const secondaryMedia = product.product_media?.filter(
                  (m: any) => !m.is_primary
                )?.[0];

                const imageUrl =
                  primaryMedia?.url ||
                  placeholders[index % placeholders.length];
                const secondaryImageUrl =
                  secondaryMedia?.url ||
                  placeholders[(index + 1) % placeholders.length];
                const brandName = product.brands?.name || "Anchor Fashion";

                return (
                  <div
                    key={product.id}
                    className="group flex flex-[0_0_45%] cursor-pointer flex-col transition-all sm:flex-[0_0_33.33%] md:flex-[0_0_25%] lg:flex-[0_0_20%]"
                  >
                    <div className="relative mb-5 aspect-[4/5] w-full overflow-hidden bg-gray-50">
                      <Link
                        href={`/product/${product.slug}`}
                        className="block h-full w-full"
                      >
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover opacity-100 transition-all duration-700 group-hover:opacity-0"
                        />
                        <Image
                          src={secondaryImageUrl}
                          alt={`${product.name} Alternate`}
                          fill
                          className="absolute inset-0 object-cover opacity-0 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                        />
                      </Link>

                      {/* Sleek Bottom Action Bar */}
                      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 flex translate-y-full justify-center transition-transform duration-500 ease-out group-hover:pointer-events-auto group-hover:translate-y-0">
                        <button
                          onClick={() =>
                            toast.success(`${product.name} added to cart!`)
                          }
                          className="flex w-full items-center justify-center gap-2 bg-black/90 py-3 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-md transition-colors hover:bg-black"
                        >
                          <ShoppingBag className="h-4 w-4" /> Add to Cart
                        </button>
                      </div>

                      {/* Wishlist Heart */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toast.success("Added to Wishlist!");
                        }}
                        className="absolute right-4 top-4 z-10 p-2 text-gray-400 transition-colors hover:text-red-500"
                        aria-label="Add to Wishlist"
                      >
                        <Heart className="h-5 w-5" strokeWidth={1.5} />
                      </button>
                    </div>

                    <Link
                      href={`/product/${product.slug}`}
                      className="flex flex-col px-2"
                    >
                      <span className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#C9A86A]">
                        {brandName}
                      </span>
                      <h3
                        className={`${jost.className} mb-1 line-clamp-1 text-lg font-medium text-[#1A1A1A] transition-colors group-hover:text-gray-500`}
                      >
                        {product.name}
                      </h3>
                      <div className="mt-1 text-sm font-medium text-gray-900">
                        {formatCurrency(product.base_price)}
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Side Navigation Buttons */}
          <button
            onClick={scrollPrev}
            className="absolute left-0 top-[40%] z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-gray-100 bg-white/80 text-gray-800 opacity-0 backdrop-blur-md transition-all hover:bg-white hover:text-black disabled:opacity-0 group-hover/carousel:opacity-100 md:-left-6"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-[40%] z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center border border-gray-100 bg-white/80 text-gray-800 opacity-0 backdrop-blur-md transition-all hover:bg-white hover:text-black disabled:opacity-0 group-hover/carousel:opacity-100 md:-right-6"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="mt-12 flex justify-center md:hidden">
          <Link
            href="/products?sort=rating"
            className="border border-black px-8 py-3 text-xs font-bold uppercase tracking-widest text-black transition-colors hover:bg-black hover:text-white"
          >
            View All Trending
          </Link>
        </div>
      </div>
    </section>
  );
}
