import React from 'react';
import Link from 'next/link';
import { HomepageHero } from '@/types/cms';

interface HeroSectionProps {
  data: HomepageHero;
}

export function HeroSection({ data }: HeroSectionProps) {
  return (
    <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0 z-0">
        {data.media_type === 'VIDEO' ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            src={data.media_url}
          />
        ) : (
          <img
            src={data.media_url}
            alt={data.headline || 'Hero image'}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Overlay */}
      <div
        className="absolute inset-0 z-10 bg-black"
        style={{ opacity: data.overlay_opacity }}
      />

      {/* Content */}
      <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto flex flex-col items-center">
        {data.headline && (
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 uppercase">
            {data.headline}
          </h1>
        )}
        
        {data.subheadline && (
          <p className="text-lg md:text-2xl font-light mb-10 max-w-2xl mx-auto">
            {data.subheadline}
          </p>
        )}
        
        {data.cta_text && data.cta_url && (
          <Link
            href={data.cta_url}
            className="inline-flex h-14 items-center justify-center bg-white text-black px-10 text-lg font-medium hover:bg-gray-100 transition-colors duration-300 uppercase tracking-widest"
          >
            {data.cta_text}
          </Link>
        )}
      </div>
    </section>
  );
}
