"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import type { HeroSlide } from "@/actions/cms.actions";

export type { HeroSlide };

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
      {/* Full-width responsive banner: exact uncropped aspect-[1896/830] on mobile/tablet, immersive full-bleed on desktop */}
      <div className="relative aspect-[1896/830] sm:aspect-[1896/830] w-full md:aspect-auto md:h-[80vh] md:min-h-[560px]">
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
              <Link
                href={ctaHref}
                className="absolute inset-0 z-10 block"
                aria-label={headline || "View Promotion"}
              >
                <span className="sr-only">{headline || "View Promotion"}</span>
              </Link>

              <div className="absolute inset-0 h-full w-full overflow-hidden bg-[#111]">
                {isVideo ? (
                  <video
                    src={imageUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload={index === 0 ? "auto" : "none"}
                    className={`h-full w-full object-cover object-center md:transition-transform md:ease-out md:[transition-duration:20s] ${
                      isActive ? "scale-100 md:scale-105" : "scale-100"
                    }`}
                    poster="/images/home/hero-banner.png"
                  />
                ) : (
                  <Image
                    src={imageUrl}
                    alt={headline ?? `Banner ${index + 1}`}
                    fill
                    sizes="100vw"
                    className={`h-full w-full object-cover object-center md:transition-transform md:ease-out md:[transition-duration:20s] ${
                      isActive ? "scale-100 md:scale-105" : "scale-100"
                    }`}
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                )}
                {/* Desktop Gradient Overlay (hidden on mobile to keep banner art 100% bright & clear) */}
                <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-black/75 via-black/20 to-transparent md:block" />
                <div className="pointer-events-none absolute inset-0 hidden bg-black/10 md:block" />
              </div>

              {/* Text Content (visible on desktop for editorial slides, hidden on mobile so designed banners are fully readable) */}
              <div className="container pointer-events-none absolute inset-0 mx-auto hidden flex-col items-center justify-end px-4 text-center text-white md:flex md:pb-28">
                {subheadline && (
                  <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-white/80 opacity-0 delay-300 duration-1000 animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards md:mb-4 md:text-sm">
                    {subheadline}
                  </p>
                )}
                {headline && (
                  <h1
                    className="mb-8 max-w-4xl text-5xl font-extralight leading-tight tracking-tight opacity-0 drop-shadow-sm delay-500 duration-1000 animate-in fade-in slide-in-from-bottom-8 fill-mode-forwards lg:text-7xl"
                  >
                    {headline}
                  </h1>
                )}
                <div className="pointer-events-auto">
                  <Link
                    href={ctaHref}
                    className="group relative flex items-center justify-center gap-3 overflow-hidden border border-white bg-transparent px-12 py-3.5 text-white opacity-0 transition-all delay-700 duration-1000 animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards hover:bg-white hover:text-black"
                  >
                    <span className="relative z-10 text-xs font-bold uppercase tracking-[0.25em] transition-colors">
                      {ctaText}
                    </span>
                    <svg
                      className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
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
            </div>
          );
        })}
      </div>

      {/* Elegant Line Indicators (only when multiple slides) */}
      {slides.length > 1 && (
        <div className="absolute bottom-1.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-3 md:bottom-10 md:gap-3">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="group relative flex items-center justify-center px-1 py-1 sm:py-2 md:py-3"
              aria-label={`Go to slide ${i + 1}`}
            >
              <span
                className={`block h-[2px] transition-all duration-700 ease-out ${
                  i === current
                    ? "w-6 sm:w-8 md:w-12 bg-[#C9A86A]"
                    : "w-3 sm:w-4 md:w-5 bg-white/40 group-hover:w-5 group-hover:bg-white/60"
                }`}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

