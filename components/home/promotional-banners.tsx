import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PromotionalBanners() {
  return (
    <section className="py-8 bg-white">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Left Large Banner */}
          <div className="md:col-span-1 flex flex-col justify-between bg-[#f5efe8] p-8 h-[400px] relative overflow-hidden group rounded-md shadow-sm">
            <div className="relative z-10">
              <p className="text-xs font-serif italic text-gray-600 mb-2">Special Deal</p>
              <h3 className="text-2xl font-serif text-gray-900 leading-tight mb-2 group-hover:text-primary transition-colors">
                Summer Offer
              </h3>
              <p className="text-4xl font-light font-serif mb-6 group-hover:scale-110 origin-left transition-transform duration-500">20% <span className="text-xl">OFF</span></p>
              <Link 
                href="/products?sale=summer"
                className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-gray-900 border-b border-gray-900 pb-1 hover:text-primary hover:border-primary transition-all group-hover:tracking-widest"
              >
                Shop Now <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-2 transition-transform" />
              </Link>
            </div>
            <div className="absolute right-0 bottom-0 w-3/4 h-3/4">
              <Image 
                src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500&q=80" 
                alt="Summer Offer" 
                fill
                className="object-cover object-left-top rounded-tl-[100px] transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-tl-[100px]" />
            </div>
          </div>

          {/* Middle Column (Two stacked banners) */}
          <div className="md:col-span-2 flex flex-col gap-6">
            
            {/* Top Middle */}
            <div className="flex-1 bg-[#f9ebeb] p-8 relative overflow-hidden group flex items-center rounded-md shadow-sm">
              <div className="relative z-10 w-1/2">
                <p className="text-xs font-serif italic text-gray-600 mb-2">Exclusive Offer</p>
                <h3 className="text-2xl font-serif text-gray-900 mb-1 group-hover:text-primary transition-colors">SALE UP TO</h3>
                <p className="text-4xl font-light font-serif mb-4 group-hover:scale-105 origin-left transition-transform duration-500">50% OFF</p>
                <Link 
                  href="/products?sale=50off"
                  className="inline-flex items-center bg-gray-900 text-white px-4 py-2 text-xs font-medium transition-all group-hover:bg-primary group-hover:shadow-lg group-hover:scale-105"
                >
                  Shop Now <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-1/2">
                <Image 
                  src="https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&q=80" 
                  alt="50% Off" 
                  fill
                  className="object-cover object-top transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#f9ebeb] via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>

            {/* Bottom Middle */}
            <div className="flex-1 bg-primary p-8 relative overflow-hidden group flex items-center rounded-md shadow-sm">
              <div className="relative z-10 w-3/5">
                <p className="text-xs font-serif italic text-white/70 mb-2">The Luxury Beauty Brand</p>
                <h3 className="text-xl md:text-2xl font-serif text-white leading-tight mb-4 group-hover:scale-105 origin-left transition-transform duration-500">
                  Long Wearing Cosmetics
                </h3>
                <Link 
                  href="/categories/beauty"
                  className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-white border-b border-white pb-1 hover:text-white/80 hover:border-white/80 transition-all group-hover:tracking-widest"
                >
                  Shop Now <ArrowRight className="ml-1 w-3 h-3 group-hover:translate-x-2 transition-transform" />
                </Link>
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-2/5 overflow-hidden">
                <Image 
                  src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&q=80" 
                  alt="Luxury Beauty" 
                  fill
                  className="object-cover object-center transition-transform duration-1000 group-hover:scale-110"
                />
                {/* Fixed gradient to transition smoothly from the primary color */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary to-transparent"></div>
              </div>
            </div>

          </div>

          {/* Right Large Banner */}
          <div className="md:col-span-1 flex flex-col bg-[#f8f9fa] p-8 h-[400px] relative overflow-hidden group rounded-md shadow-sm">
            <div className="relative z-10 text-center mt-4">
              <p className="text-xs font-serif italic text-gray-600 mb-2">New Arrival</p>
              <h3 className="text-xl font-serif text-gray-900 leading-tight mb-4 group-hover:text-primary transition-colors">
                Summer<br />Trouser Suit
              </h3>
              <Link 
                href="/products/trouser-suit"
                className="inline-flex items-center bg-white border border-gray-200 text-gray-900 px-4 py-2 text-xs font-medium hover:bg-primary hover:text-white hover:border-primary transition-all group-hover:shadow-lg"
              >
                Shop Now <ArrowRight className="ml-2 w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="absolute inset-0 mt-32">
              <Image 
                src="https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=600&q=80" 
                alt="Trouser Suit" 
                fill
                className="object-cover object-top transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
