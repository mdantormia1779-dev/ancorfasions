"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, ChevronLeft, ChevronRight, ShoppingBag, Eye } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, KeyboardEvent } from "react";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  slug: string;
  base_price: number;
  brands?: { name: string } | null;
  product_media?: { url: string; is_primary: boolean }[];
}

export function BrandedCollection({ products }: { products: Product[] }) {
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

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft') {
      scrollPrev();
    } else if (e.key === 'ArrowRight') {
      scrollNext();
    }
  }, [scrollPrev, scrollNext]);

  // Use a fallback to ensure we show something in dev if DB is empty
  const placeholders = [
    "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=500&q=80",
    "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&q=80",
    "https://images.unsplash.com/photo-1596455607563-ad6193f76b11?w=500&q=80",
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80",
    "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?w=500&q=80"
  ];

  // Fill with dummy products if needed
  const displayProducts = products && products.length > 0 ? products : [];
  const dummyProducts: Product[] = Array.from({ length: Math.max(0, 8 - displayProducts.length) }).map((_, i) => ({
    id: `dummy-${i}`,
    name: "Classic Collection Item",
    slug: "classic-item",
    base_price: 3999,
    brands: { name: "Anchor Exclusive" }
  }));

  const finalProducts = [...displayProducts, ...dummyProducts].slice(0, 8);

  return (
    <section className="py-16 bg-white relative">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold tracking-widest text-primary uppercase">
              New Arrivals
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-gray-900">
              Branded Collection
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/products" 
              className="group flex items-center text-sm font-medium text-gray-900 hover:text-primary transition-colors hidden md:flex"
            >
              View All Products 
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        {/* Embla Carousel Viewport */}
        <div 
          className="relative group/carousel outline-none"
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          <div className="overflow-hidden -mx-4 px-4" ref={emblaRef}>
          <div className="flex gap-6 py-2">
            {finalProducts.map((product, index) => {
              const primaryMedia = product.product_media?.find(m => m.is_primary) || product.product_media?.[0];
              const secondaryMedia = product.product_media?.filter(m => !m.is_primary)?.[0];
              
              const imageUrl = primaryMedia?.url || placeholders[index % placeholders.length];
              const secondaryImageUrl = secondaryMedia?.url || placeholders[(index + 1) % placeholders.length];
              const brandName = product.brands?.name || "Unknown Brand";

              return (
                <div key={product.id} className="group flex flex-col flex-[0_0_70%] sm:flex-[0_0_45%] md:flex-[0_0_30%] lg:flex-[0_0_20%] cursor-pointer">
                  <div className="relative w-full aspect-[3/4] mb-4 bg-gray-50 overflow-hidden rounded-sm">
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
                  </div>
                  
                  <Link href={`/product/${product.slug}`} className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900 mb-1">
                      {brandName}
                    </span>
                    <h3 className="text-sm text-gray-600 truncate mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">
                        {formatCurrency(product.base_price)}
                      </span>
                      {/* Dummy Color Swatches */}
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full bg-[#1e293b] border border-gray-200"></div>
                        <div className="w-3 h-3 rounded-full bg-[#d6c5b3] border border-gray-200"></div>
                        <div className="w-3 h-3 rounded-full bg-[#8c9ca7] border border-gray-200"></div>
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
            className="absolute left-0 md:-left-4 top-[40%] -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary hover:scale-110 transition-all opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" strokeWidth={2.5} />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 md:-right-4 top-[40%] -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-primary hover:scale-110 transition-all opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>
        
        {/* Mobile View All Link */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link 
            href="/products" 
            className="group flex items-center text-sm font-medium text-gray-900 hover:text-primary transition-colors"
          >
            View All Products 
            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}
