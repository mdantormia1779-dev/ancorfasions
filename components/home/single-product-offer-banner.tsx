"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export function SingleProductOfferBanner() {
  return (
    <section className="py-16 bg-white">
      <div className="container px-4 md:px-6">
        <div className="bg-[#f0f4f8] rounded-md overflow-hidden shadow-sm flex flex-col md:flex-row items-center">
          
          <div className="w-full md:w-1/2 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <div className="inline-flex items-center gap-1 bg-white px-3 py-1 rounded-full text-xs font-bold text-primary shadow-sm w-max mb-6">
              <Star className="w-3.5 h-3.5 fill-primary" /> 
              Deal of the Week
            </div>
            
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-gray-900 leading-tight mb-4">
              Premium Leather <br/> Weekend Bag
            </h2>
            
            <p className="text-gray-600 mb-8 max-w-md">
              Handcrafted with full-grain leather, featuring a spacious interior and multiple compartments for your weekend getaways.
            </p>
            
            <div className="flex items-center gap-4 mb-8">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500 line-through">{formatCurrency(12500)}</span>
                <span className="text-3xl font-bold text-primary">{formatCurrency(8500)}</span>
              </div>
              <div className="bg-red-100 text-red-600 px-2 py-1 rounded-sm text-xs font-bold uppercase tracking-widest">
                Save 32%
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Link 
                href="/products/premium-leather-weekend-bag"
                className="inline-flex items-center justify-center bg-primary text-white px-8 py-3.5 text-sm font-bold uppercase tracking-wider hover:bg-black transition-colors rounded-sm shadow-md hover:shadow-lg"
              >
                Shop Now <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 relative min-h-[400px] md:min-h-[500px]">
            <Image
              src="https://images.unsplash.com/photo-1547949003-9792a18a2601?w=800&q=80"
              alt="Premium Leather Weekend Bag"
              fill
              className="object-cover"
            />
          </div>
          
        </div>
      </div>
    </section>
  );
}
