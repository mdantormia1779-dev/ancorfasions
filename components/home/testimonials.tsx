"use client";

import { Star, Quote } from "lucide-react";
import { Jost } from "next/font/google";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

const testimonials = [
  {
    id: 1,
    name: "Nusrat Jahan",
    role: "Verified Buyer",
    location: "Dhaka",
    content: "The quality of the kurtis I received is absolutely outstanding. They fit perfectly and the fabric feels so premium. I'm definitely shopping here again and again!",
    rating: 5,
    product: "Summer Kurti Collection"
  },
  {
    id: 2,
    name: "Rania Hossain",
    role: "Verified Buyer",
    location: "Chittagong",
    content: "Anchor Fashion's customer service is top-notch. I had an issue with sizing, and they exchanged it within two days. The new dress looks absolutely gorgeous on me.",
    rating: 5,
    product: "Evening Dress"
  },
  {
    id: 3,
    name: "Lamia Sultana",
    role: "Verified Buyer",
    location: "Sylhet",
    content: "I've been looking for authentic, elegant ethnic wear and I finally found it here. The embroidery and the craftsmanship are simply stunning. Worth every taka!",
    rating: 5,
    product: "Ethnic Saree"
  }
];

export function Testimonials() {
  return (
    <section className={`${jost.className} py-20 md:py-28 bg-[#0D1B2A]`}>
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold tracking-[0.35em] uppercase text-[#C9A86A] mb-4 block">
            Customer Reviews
          </span>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight text-white">
            Loved by Thousands.
          </h2>
          <p className="text-white/40 mt-3 text-sm font-light max-w-md mx-auto">
            Don&apos;t just take our word for it — here&apos;s what our community says.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={t.id}
              className="relative p-8 border border-white/10 hover:border-[#C9A86A]/40 transition-all duration-500 group flex flex-col"
            >
              {/* Large quote mark */}
              <Quote className="w-8 h-8 text-[#C9A86A]/30 mb-6 flex-shrink-0" />

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {[...Array(t.rating)].map((_, j) => (
                  <Star key={j} className="w-3.5 h-3.5 fill-[#C9A86A] text-[#C9A86A]" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-white/70 text-sm leading-relaxed font-light flex-1 mb-8">
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Reviewer Info */}
              <div className="border-t border-white/10 pt-6 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-white text-sm">{t.name}</h4>
                  <p className="text-[11px] text-white/40 mt-0.5">{t.role} · {t.location}</p>
                </div>
                <span className="text-[9px] font-bold tracking-wider uppercase text-[#C9A86A]/60 text-right max-w-[100px]">
                  {t.product}
                </span>
              </div>

              {/* Gold accent line on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#C9A86A] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </div>
          ))}
        </div>

        {/* Overall Rating Summary */}
        <div className="mt-12 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 fill-[#C9A86A] text-[#C9A86A]" />
            ))}
          </div>
          <p className="text-white/40 text-sm font-light">
            <span className="text-white font-semibold">4.9 / 5</span> based on 2,400+ reviews
          </p>
        </div>
      </div>
    </section>
  );
}
