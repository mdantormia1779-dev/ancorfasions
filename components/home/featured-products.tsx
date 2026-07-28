"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, ChevronLeft, ChevronRight, Star, ShoppingBag, Eye } from "lucide-react";
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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    dragFree: false,
  }, [Autoplay({ delay: 4000, stopOnInteraction: true })]);

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
    "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500&q=80"
  ];

  const displayProducts = products && products.length > 0 ? products : [];
  const dummyProducts: Product[] = Array.from({ length: Math.max(0, 8 - displayProducts.length) }).map((_, i) => ({
    id: `featured-${i}`,
    name: "Trending Collection Item",
    slug: "trending-item",
    base_price: 4500,
    brands: { name: "Anchor Fashion" },
    average_rating: 5,
  }));

  const finalProducts = [...displayProducts, ...dummyProducts].slice(0, 8);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold tracking-widest text-primary uppercase">
              Top Picks
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900">
              Featured Products
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/products?sort=rating" 
              className="group flex items-center text-sm font-medium text-gray-900 hover:text-primary transition-colors hidden md:flex mr-4"
            >
              View All Featured
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        <div className="relative group/carousel">
          <div className="overflow-hidden -mx-4 px-4" ref={emblaRef}>
            <div className="flex gap-6 py-2">
              {finalProducts.map((product, index) => {
                const primaryMedia = product.product_media?.find(m => m.is_primary) || product.product_media?.[0];
                const secondaryMedia = product.product_media?.filter(m => !m.is_primary)?.[0];
                
                const imageUrl = primaryMedia?.url || placeholders[index % placeholders.length];
                const secondaryImageUrl = secondaryMedia?.url || placeholders[(index + 1) % placeholders.length];
                const brandName = product.brands?.name || "Unknown Brand";

                return (
                  <div key={product.id} className="group flex flex-col flex-[0_0_75%] sm:flex-[0_0_50%] md:flex-[0_0_35%] lg:flex-[0_0_25%] bg-transparent rounded-md transition-shadow cursor-pointer">
                    <div className="relative w-full aspect-[4/5] mb-4 bg-gray-100 overflow-hidden rounded-sm group-hover:shadow-lg transition-all duration-500">
                      <Link href={`/product/${product.slug}`} className="block w-full h-full">
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover object-top transition-all duration-700 opacity-100 group-hover:opacity-0 group-hover:scale-105"
                        />
                        <Image
                          src={secondaryImageUrl}
                          alt={`${product.name} Alternate`}
                          fill
                          className="object-cover object-top absolute inset-0 transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                        />
                      </Link>
                      
                      {/* Floating Action Buttons from Bottom */}
                      <div className="absolute left-0 right-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex justify-center gap-2 pointer-events-none group-hover:pointer-events-auto z-10">
                        <button className="flex-1 bg-primary text-white text-xs font-semibold py-2.5 rounded-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors shadow-md">
                          <ShoppingBag className="w-4 h-4" /> Add to Cart
                        </button>
                        <Link href={`/product/${product.slug}`} className="w-10 h-10 bg-white text-gray-900 rounded-sm flex items-center justify-center hover:bg-gray-100 transition-colors shadow-md">
                          <Eye className="w-4 h-4" />
                        </Link>
                      </div>

                      <button className="absolute top-3 right-3 p-2 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:text-red-500 shadow-md z-10">
                        <Heart className="w-4 h-4" strokeWidth={2.5} />
                      </button>
                      
                      <div className="absolute top-3 left-3 px-2 py-1 bg-white/90 backdrop-blur text-xs font-bold rounded-sm flex items-center gap-1 shadow-sm z-10">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {product.average_rating || "5.0"}
                      </div>
                    </div>
                    
                    <Link href={`/product/${product.slug}`} className="flex flex-col flex-1 px-1">
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                        {brandName}
                      </span>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-primary transition-colors">
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
            className="absolute left-0 md:-left-4 top-[40%] -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary hover:scale-110 transition-all opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2} />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 md:-right-4 top-[40%] -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary hover:scale-110 transition-all opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" strokeWidth={2} />
          </button>
        </div>
        
        <div className="mt-8 flex justify-center md:hidden">
          <Link 
            href="/products?sort=rating" 
            className="group flex items-center text-sm font-medium text-gray-900 hover:text-primary transition-colors"
          >
            View All Featured
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
