"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Heart, ShoppingBag, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback } from "react";
import { formatCurrency } from "@/lib/utils";
import { Jost } from 'next/font/google';
import { toast } from "sonner";

const jost = Jost({ subsets: ['latin'], weight: ['300', '400', '500'] });

export function TrendingProducts({ products }: { products: any[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: true,
    dragFree: false,
  }, [Autoplay({ delay: 5000, stopOnInteraction: true })]);

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
    "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=500&q=80"
  ];

  return (
    <section className="py-16 md:py-32 bg-white">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-4 border-b border-gray-100 pb-6">
          <div className="max-w-2xl">
            <h2 className={`${jost.className} text-3xl md:text-5xl text-[#1A1A1A] mb-3 font-light tracking-tight`}>
              Trending Now
            </h2>
            <p className="text-gray-500 text-sm tracking-wide">
              Discover the pieces our community can't get enough of.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="/products?sort=rating" 
              className="group flex items-center text-xs font-bold tracking-[0.2em] uppercase text-[#1A1A1A] hover:text-[#C9A86A] transition-colors hidden md:flex mr-4"
            >
              View All 
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        <div className="relative group/carousel">
          <div className="overflow-hidden -mx-4 px-4" ref={emblaRef}>
            <div className="flex gap-4 py-4">
              {products.map((product, index) => {
                const primaryMedia = product.product_media?.find((m: any) => m.is_primary) || product.product_media?.[0];
                const secondaryMedia = product.product_media?.filter((m: any) => !m.is_primary)?.[0];
                
                const imageUrl = primaryMedia?.url || placeholders[index % placeholders.length];
                const secondaryImageUrl = secondaryMedia?.url || placeholders[(index + 1) % placeholders.length];
                const brandName = product.brands?.name || "Anchor Fashion";

                return (
                  <div key={product.id} className="group flex flex-col flex-[0_0_80%] sm:flex-[0_0_50%] md:flex-[0_0_33.33%] lg:flex-[0_0_25%] transition-all cursor-pointer">
                    <div className="relative w-full aspect-[3/4] mb-5 bg-gray-50 overflow-hidden">
                      <Link href={`/product/${product.slug}`} className="block w-full h-full">
                        <Image
                          src={imageUrl}
                          alt={product.name}
                          fill
                          className="object-cover transition-all duration-700 opacity-100 group-hover:opacity-0"
                        />
                        <Image
                          src={secondaryImageUrl}
                          alt={`${product.name} Alternate`}
                          fill
                          className="object-cover absolute inset-0 transition-all duration-700 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                        />
                      </Link>
                      
                      {/* Elegant Slide-up Actions */}
                      <div className="absolute left-0 right-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex justify-center gap-2 pointer-events-none group-hover:pointer-events-auto z-10 bg-gradient-to-t from-black/20 to-transparent">
                        <button 
                          onClick={() => toast.success(`${product.name} added to cart!`)}
                          className="flex-1 bg-white text-black text-xs font-bold tracking-widest uppercase py-3 flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors shadow-sm"
                        >
                          Add to Cart
                        </button>
                        <Link 
                          href={`/product/${product.slug}`} 
                          className="w-12 bg-white text-black flex items-center justify-center hover:bg-black hover:text-white transition-colors shadow-sm"
                          aria-label="View Product"
                        >
                          <Eye className="w-5 h-5" strokeWidth={1.5} />
                        </Link>
                      </div>

                      {/* Wishlist Heart */}
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          toast.success('Added to Wishlist!');
                        }}
                        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 transition-colors z-10"
                        aria-label="Add to Wishlist"
                      >
                        <Heart className="w-5 h-5" strokeWidth={1.5} />
                      </button>
                    </div>
                    
                    <Link href={`/product/${product.slug}`} className="flex flex-col px-2">
                      <span className="text-[10px] font-bold text-[#C9A86A] uppercase tracking-[0.2em] mb-2">
                        {brandName}
                      </span>
                      <h3 className={`${jost.className} text-lg text-[#1A1A1A] line-clamp-1 mb-1 group-hover:text-gray-500 transition-colors font-medium`}>
                        {product.name}
                      </h3>
                      <div className="text-sm font-medium text-gray-900 mt-1">
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
            className="absolute left-0 md:-left-6 top-[40%] -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md border border-gray-100 flex items-center justify-center text-gray-800 hover:text-black hover:bg-white transition-all opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button
            onClick={scrollNext}
            className="absolute right-0 md:-right-6 top-[40%] -translate-y-1/2 w-12 h-12 bg-white/80 backdrop-blur-md border border-gray-100 flex items-center justify-center text-gray-800 hover:text-black hover:bg-white transition-all opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
        
        <div className="mt-12 flex justify-center md:hidden">
          <Link 
            href="/products?sort=rating"
            className="border border-black text-black px-8 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
          >
            View All Trending
          </Link>
        </div>
      </div>
    </section>
  );
}
