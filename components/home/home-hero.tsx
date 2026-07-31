"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Jost } from "next/font/google";

const jost = Jost({ subsets: ["latin"], weight: ["200", "300", "400", "500"] });

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
  {
    id: 1,
    ctaHref: "/products?sort=newest",
    image: "/images/home/hero-banner.png",
  },
  {
    id: 2,
    ctaHref: "/categories/ethnic",
    image: "/images/home/hero-slide-2.png",
  },
  {
    id: 3,
    ctaHref: "/categories/summer",
    image: "/images/home/hero-slide-3.png",
  },
];

export function HomeHero({ slides: propSlides }: { slides?: HeroSlide[] }) {
  const slides =
    propSlides && propSlides.length > 0 ? propSlides : DEFAULT_SLIDES;
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (animating) return;
      setAnimating(true);
      setTimeout(() => {
        setCurrent(index);
        setAnimating(false);
      }, 700); // Slower, more elegant crossfade
    },
    [animating]
  );

  const next = useCallback(
    () => goTo((current + 1) % slides.length),
    [current, goTo, slides.length]
  );

  // Auto-play
  useEffect(() => {
    const timer = setInterval(next, 6500); // slightly longer reading time
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full overflow-hidden bg-[#1A1A1A]">
      {/* 85vh for an immersive, premium full-bleed feel */}
      <div className="relative h-[70vh] min-h-[600px] w-full md:h-[85vh]">
        {slides.map((slide, index) => {
          const isActive = index === current;
          const imageUrl =
            slide.media_url ?? slide.image ?? "/images/home/hero-banner.png";
          const ctaHref = slide.cta_url ?? slide.ctaHref ?? "/products";

          return (
            <div
              key={slide.id}
              className="absolute inset-0 h-full w-full transition-transform duration-1000 ease-in-out"
              style={{ transform: `translateX(${(index - current) * 100}%)` }}
            >
              <div className="absolute inset-0 h-full w-full overflow-hidden bg-[#111]">
                <Image
                  src={imageUrl}
                  alt={slide.headline ?? `Banner ${index + 1}`}
                  fill
                  className={`object-cover object-center transition-transform ease-out [transition-duration:10s] ${
                    isActive ? "scale-105" : "scale-100"
                  }`}
                  priority={index === 0}
                />
                {/* Premium Gradient Overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="pointer-events-none absolute inset-0 bg-black/10" />
              </div>

              {/* Text Content */}
              <div className="container absolute inset-0 mx-auto flex flex-col items-center justify-end px-4 pb-24 text-center text-white md:pb-32">
                {slide.subheadline && (
                  <p className="mb-4 text-sm uppercase tracking-[0.3em] text-white/80 opacity-0 delay-300 duration-1000 animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards md:text-base">
                    {slide.subheadline}
                  </p>
                )}
                {slide.headline && (
                  <h1
                    className={`${jost.className} mb-8 max-w-4xl text-5xl font-light leading-[1.05] tracking-tight opacity-0 drop-shadow-sm delay-500 duration-1000 animate-in fade-in slide-in-from-bottom-8 fill-mode-forwards md:text-7xl lg:text-8xl`}
                  >
                    {slide.headline}
                  </h1>
                )}
                <Link
                  href={ctaHref}
                  className="group relative flex items-center justify-center gap-3 overflow-hidden border border-white bg-transparent px-12 py-4 text-white opacity-0 transition-all delay-700 duration-1000 animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards hover:scale-[1.02] hover:border-[#C9A86A]"
                >
                  <span className="relative z-10 text-xs font-bold uppercase tracking-[0.3em] transition-colors group-hover:text-[#C9A86A]">
                    {slide.cta_text || "Discover More"}
                  </span>
                  <svg
                    className="relative z-10 h-4 w-4 transition-all group-hover:translate-x-1 group-hover:text-[#C9A86A]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                  <div className="absolute inset-0 origin-left scale-x-0 transform bg-[#C9A86A]/10 transition-transform duration-500 ease-out group-hover:scale-x-100" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Elegant Line Indicators */}
      <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 md:bottom-12">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="group relative flex items-center justify-center px-1 py-4"
            aria-label={`Go to slide ${i + 1}`}
          >
            <span
              className={`block h-[2px] transition-all duration-700 ease-out ${
                i === current
                  ? "w-12 bg-[#C9A86A]"
                  : "w-5 bg-white/30 group-hover:w-7 group-hover:bg-white/60"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
