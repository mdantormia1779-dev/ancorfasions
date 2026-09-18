"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { Jost } from "next/font/google";
import type { HeroSlide } from "@/actions/cms.actions";

export type { HeroSlide };

const jost = Jost({ subsets: ["latin"], weight: ["200", "300", "400", "500"] });

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 1,
    ctaHref: "/products?sort=newest",
    image: "https://videos.pexels.com/video-files/5192138/5192138-uhd_2160_4096_25fps.mp4",
    isVideo: true,
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

  // Auto-play (only when more than 1 slide)
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(next, 6500); // slightly longer reading time
    return () => clearInterval(timer);
  }, [next, slides.length]);

  return (
    <section className="relative w-full overflow-hidden bg-[#1A1A1A]">
      {/* 85vh for an immersive, premium full-bleed feel on desktop, standard 16:9 or 4:3 banner on mobile */}
      <div className="relative aspect-[4/3] sm:aspect-[16/9] w-full md:aspect-auto md:h-[85vh] md:min-h-[600px]">
        {slides.map((slide, index) => {
          const isActive = index === current;
          const imageUrl =
            slide.image_url ?? slide.media_url ?? slide.image ?? "/images/home/hero-banner.png";
          const ctaHref = slide.link_url ?? slide.cta_url ?? slide.ctaHref ?? "/products";
          const headline = slide.title ?? slide.headline;
          const subheadline = slide.subtitle ?? slide.subheadline;
          const ctaText = slide.cta_text || "Discover More";
          const isVideo = slide.isVideo || imageUrl.endsWith(".mp4") || imageUrl.includes("/video-files/");

          return (
            <div
              key={slide.id}
              className="absolute inset-0 h-full w-full transition-transform duration-1000 ease-in-out"
              style={{ transform: `translateX(${(index - current) * 100}%)` }}
            >
              <div className="absolute inset-0 h-full w-full overflow-hidden bg-[#111]">
                {isVideo ? (
                  <video
                    src={imageUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload={index === 0 ? "auto" : "none"}
                    className={`h-full w-full object-cover object-center transition-transform ease-out [transition-duration:20s] ${
                      isActive ? "scale-110" : "scale-100"
                    }`}
                    poster="/images/home/hero-banner.png"
                  />
                ) : (
                  <Image
                    src={imageUrl}
                    alt={headline ?? `Banner ${index + 1}`}
                    fill
                    sizes="100vw"
                    className={`object-cover object-center transition-transform ease-out [transition-duration:20s] ${
                      isActive ? "scale-110" : "scale-100"
                    }`}
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                )}
                {/* Premium Gradient Overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="pointer-events-none absolute inset-0 bg-black/10" />
              </div>

              {/* Text Content */}
              <div className="container absolute inset-0 mx-auto flex flex-col items-center justify-end px-4 pb-12 text-center text-white md:pb-32">
                {subheadline && (
                  <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-white/90 opacity-0 delay-300 duration-1000 animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards md:mb-4 md:text-sm md:tracking-[0.3em] md:text-white/80">
                    {subheadline}
                  </p>
                )}
                {headline && (
                  <h1
                    className={`${jost.className} mb-6 max-w-4xl text-3xl font-light leading-[1.15] tracking-tight opacity-0 drop-shadow-sm delay-500 duration-1000 animate-in fade-in slide-in-from-bottom-8 fill-mode-forwards sm:text-4xl md:mb-10 md:text-7xl md:font-extralight lg:text-8xl`}
                  >
                    {headline}
                  </h1>
                )}
                <Link
                  href={ctaHref}
                  className="group relative flex items-center justify-center gap-3 overflow-hidden border border-white bg-transparent px-8 py-3 text-white opacity-0 transition-all delay-700 duration-1000 animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards hover:bg-white hover:text-black md:px-14 md:py-4"
                >
                  <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors md:text-xs md:tracking-[0.25em]">
                    {ctaText}
                  </span>
                  <svg
                    className="relative z-10 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1 md:h-4 md:w-4"
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
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Elegant Line Indicators (only when multiple slides) */}
      {slides.length > 1 && (
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
      )}
    </section>
  );
}

