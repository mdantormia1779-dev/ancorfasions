"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Jost } from 'next/font/google';

const jost = Jost({ subsets: ['latin'], weight: ['200', '300', '400', '500'] });

type HeroSlide = {
  id: string | number;
  media_url?: string;
  image?: string;
  cta_url?: string;
  ctaHref?: string;
  headline?: string | null;
  subheadline?: string | null;
  cta_text?: string | null;
};

const DEFAULT_SLIDES: HeroSlide[] = [
  { id: 1, ctaHref: "/products?sort=newest", image: "/images/home/hero-banner.png" },
  { id: 2, ctaHref: "/categories/ethnic", image: "/images/home/hero-slide-2.png" },
  { id: 3, ctaHref: "/categories/summer", image: "/images/home/hero-slide-3.png" },
];

export function HomeHero({ slides: propSlides }: { slides?: HeroSlide[] }) {
  const slides = propSlides && propSlides.length > 0 ? propSlides : DEFAULT_SLIDES;
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((index: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(index);
      setAnimating(false);
    }, 700); // Slower, more elegant crossfade
  }, [animating]);

  const next = useCallback(() => goTo((current + 1) % slides.length), [current, goTo, slides.length]);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(next, 6500); // slightly longer reading time
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full overflow-hidden bg-[#1A1A1A]">
      {/* 85vh for an immersive, premium full-bleed feel */}
      <div className="relative w-full h-[70vh] md:h-[85vh] min-h-[600px]">
        {slides.map((slide, index) => {
          const isActive = index === current;
          const imageUrl = slide.media_url ?? slide.image ?? "/images/home/hero-banner.png";
          const ctaHref = slide.cta_url ?? slide.ctaHref ?? "/products";

          return (
            <div
              key={slide.id}
              className="absolute inset-0 w-full h-full transition-transform duration-1000 ease-in-out"
              style={{ transform: `translateX(${(index - current) * 100}%)` }}
            >
              <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#111]">
                <Image
                  src={imageUrl}
                  alt={slide.headline ?? `Banner ${index + 1}`}
                  fill
                  className={`object-cover object-center transition-transform [transition-duration:10s] ease-out ${
                    isActive ? "scale-105" : "scale-100"
                  }`}
                  priority={index === 0}
                />
                {/* Premium Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              </div>

              {/* Text Content */}
              <div className="absolute inset-0 flex flex-col justify-end items-center text-center text-white pb-24 md:pb-32 px-4 container mx-auto">
                {slide.subheadline && (
                  <p className="text-sm md:text-base uppercase tracking-[0.3em] text-white/80 mb-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 fill-mode-forwards opacity-0">
                    {slide.subheadline}
                  </p>
                )}
                {slide.headline && (
                  <h1 className={`${jost.className} text-5xl md:text-7xl lg:text-8xl font-light mb-8 max-w-4xl leading-[1.05] tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-forwards opacity-0 drop-shadow-sm`}>
                    {slide.headline}
                  </h1>
                )}
                <Link
                  href={ctaHref}
                  className="group relative overflow-hidden bg-transparent border border-white text-white px-12 py-4 flex items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-700 fill-mode-forwards opacity-0 transition-all hover:border-[#C9A86A] hover:scale-[1.02]"
                >
                  <span className="relative z-10 text-xs font-bold tracking-[0.3em] uppercase transition-colors group-hover:text-[#C9A86A]">
                    {slide.cta_text || "Discover More"}
                  </span>
                  <svg className="w-4 h-4 relative z-10 transition-all group-hover:text-[#C9A86A] group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  <div className="absolute inset-0 bg-[#C9A86A]/10 transform scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100 origin-left" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Elegant Line Indicators */}
      <div className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="group relative flex items-center justify-center py-4 px-1"
            aria-label={`Go to slide ${i + 1}`}
          >
            <span 
              className={`block h-[2px] transition-all duration-700 ease-out ${
                i === current 
                  ? "w-12 bg-[#C9A86A]" 
                  : "w-5 bg-white/30 group-hover:bg-white/60 group-hover:w-7"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
