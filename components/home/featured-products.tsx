"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  ChevronLeft,
  ChevronRight,
  Star,
  ShoppingBag,
  Eye,
} from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback } from "react";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  brands?: { name: string } | null;
  product_media?: { url: string; is_primary: boolean }[];
  average_rating?: number;
}

export function FeaturedProducts({ products }: { products: Product[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      align: "start",
      loop: true,
      dragFree: false,
    },
    [Autoplay({ delay: 4000, stopOnInteraction: true })]
  );

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const placeholders = [
    "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?w=500&q=80",
    "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=500&q=80",
    "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&q=80",
    "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w=500&q=80",
    "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500&q=80",
  ];

  const displayProducts = products && products.length > 0 ? products : [];
  const dummyProducts: Product[] = Array.from({
    length: Math.max(0, 8 - displayProducts.length),
  }).map((_, i) => ({
    id: `featured-${i}`,
    name: "Trending Collection Item",
    slug: "trending-item",
    base_price: 4500,
    brands: { name: "Anchor Fashion" },
    average_rating: 5,
  }));

  const finalProducts = [...displayProducts, ...dummyProducts].slice(0, 8);

  return (
    <section className="bg-gray-50 py-16">
      <div className="container px-4 md:px-6">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              Top Picks
            </span>
            <h2 className="font-serif text-3xl text-gray-900 md:text-4xl">
              Featured Products
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/products?sort=rating"
              className="group mr-4 flex hidden items-center text-sm font-medium text-gray-900 transition-colors hover:text-primary md:flex"
            >
              View All Featured
              <ArrowRight
                className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                strokeWidth={2.5}
              />
            </Link>
          </div>
        </div>

        <div className="group/carousel relative">
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
                    className="group flex flex-[0_0_75%] cursor-pointer flex-col rounded-md bg-transparent transition-shadow sm:flex-[0_0_50%] md:flex-[0_0_35%] lg:flex-[0_0_25%]"
                  >
                    <div className="relative mb-4 aspect-[4/5] w-full overflow-hidden rounded-sm bg-gray-100 transition-all duration-500 group-hover:shadow-lg">
                      <Link
                        href={`/product/${product.slug}`}
                        className="block h-full w-full"
                      >
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover object-top opacity-100 transition-all duration-700 group-hover:scale-105 group-hover:opacity-0"
                        />
                        <Image
                          src={secondaryImageUrl}
                          alt={`${product.name} Alternate`}
                          fill
                          className="absolute inset-0 object-cover object-top opacity-0 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                        />
                      </Link>

                      {/* Floating Action Buttons from Bottom */}
                      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 flex translate-y-full justify-center gap-2 p-3 transition-transform duration-500 ease-out group-hover:pointer-events-auto group-hover:translate-y-0">
                        <button className="flex flex-1 items-center justify-center gap-2 rounded-sm bg-primary py-2.5 text-xs font-semibold text-white shadow-md transition-colors hover:bg-primary/90">
                          <ShoppingBag className="h-4 w-4" /> Add to Cart
                        </button>
                        <Link
                          href={`/product/${product.slug}`}
                          className="flex h-10 w-10 items-center justify-center rounded-sm bg-white text-gray-900 shadow-md transition-colors hover:bg-gray-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </div>

                      <button className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 opacity-0 shadow-md transition-opacity duration-300 hover:text-red-500 group-hover:opacity-100">
                        <Heart className="h-4 w-4" strokeWidth={2.5} />
                      </button>

                      <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-sm bg-white/90 px-2 py-1 text-xs font-bold shadow-sm backdrop-blur">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {product.average_rating || "5.0"}
                      </div>
                    </div>

                    <Link
                      href={`/product/${product.slug}`}
                      className="flex flex-1 flex-col px-1"
                    >
                      <span className="mb-1 text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        {brandName}
                      </span>
                      <h3 className="mb-2 line-clamp-2 text-sm font-medium text-gray-900 transition-colors group-hover:text-primary">
                        {product.name}
                      </h3>
                      <div className="mt-auto flex items-center justify-between">
                        <span className="text-base font-bold text-gray-900">
                          {formatCurrency(product.base_price)}
                        </span>
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
            className="absolute left-0 top-[40%] z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-600 opacity-0 shadow-lg transition-all hover:scale-110 hover:text-primary disabled:opacity-0 group-hover/carousel:opacity-100 md:-left-4"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" strokeWidth={2} />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 top-[40%] z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-gray-100 bg-white text-gray-600 opacity-0 shadow-lg transition-all hover:scale-110 hover:text-primary disabled:opacity-0 group-hover/carousel:opacity-100 md:-right-4"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" strokeWidth={2} />
          </button>
        </div>

        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href="/products?sort=rating"
            className="group flex items-center text-sm font-medium text-gray-900 transition-colors hover:text-primary"
          >
            View All Featured
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
