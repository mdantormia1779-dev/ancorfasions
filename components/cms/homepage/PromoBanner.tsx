import React from 'react';
import Link from 'next/link';
import { HomepagePromotion } from '@/types/cms';

interface PromoBannerProps {
  data: HomepagePromotion;
}

export function PromoBanner({ data }: PromoBannerProps) {
  return (
    <section 
      className="relative w-full py-20 px-4 flex items-center justify-center overflow-hidden my-12"
      style={{ backgroundColor: data.bg_color || '#f4f4f5' }}
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Content */}
        <div className="order-2 md:order-1 flex flex-col items-start justify-center p-8 md:p-12 bg-white/90 backdrop-blur-sm z-10 shadow-sm">
          {data.title && (
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-black tracking-tight">
              {data.title}
            </h2>
          )}
          {data.description && (
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              {data.description}
            </p>
          )}
          {data.cta_text && data.cta_url && (
            <Link
              href={data.cta_url}
              className="inline-flex h-12 items-center justify-center bg-black text-white px-8 font-medium hover:bg-gray-800 transition-colors uppercase tracking-wider text-sm"
            >
              {data.cta_text}
            </Link>
          )}
        </div>

        {/* Media */}
        <div className="order-1 md:order-2 relative h-[300px] md:h-[500px] w-full">
          <picture>
            {data.image_mobile && (
              <source media="(max-width: 768px)" srcSet={data.image_mobile} />
            )}
            <img
              src={data.image_desktop}
              alt={data.title || 'Promotional Banner'}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </picture>
        </div>
      </div>
    </section>
  );
}
