"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // When images array changes (e.g. variant selection), reset index to 0
  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl bg-zinc-100 border border-zinc-200">
        <span className="text-xs uppercase tracking-widest text-zinc-400">No Image Available</span>
      </div>
    );
  }

  const safeIndex = Math.min(currentIndex, Math.max(0, images.length - 1));

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  return (
    <>
      <div className="flex flex-col-reverse gap-4 md:flex-row">
        {/* Thumbnails (only display if more than 1 image) */}
        {images.length > 1 && (
          <div className="scrollbar-hide flex max-h-[620px] shrink-0 gap-3 overflow-x-auto md:flex-col md:overflow-y-auto">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`group relative h-24 w-20 shrink-0 overflow-hidden rounded-lg transition-all duration-300 ${
                  safeIndex === idx
                    ? "ring-2 ring-black opacity-100 shadow-sm"
                    : "border border-gray-200 opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </button>
            ))}
          </div>
        )}

        {/* Main Image Frame */}
        <div
          className="group relative aspect-[4/5] w-full flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-[#F9F9F9] border border-gray-100 shadow-sm"
          onClick={() => setIsLightboxOpen(true)}
          onMouseMove={(e) => {
            const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
            const x = (e.clientX - left) / width;
            const y = (e.clientY - top) / height;
            e.currentTarget.style.setProperty("--mouse-x", `${x * 100}%`);
            e.currentTarget.style.setProperty("--mouse-y", `${y * 100}%`);
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={safeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-115"
              style={{ transformOrigin: "var(--mouse-x, 50%) var(--mouse-y, 50%)" }}
            >
              <Image
                src={images[safeIndex] || images[0]}
                alt={`Product image ${safeIndex + 1}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 55vw"
                className="object-cover object-center"
              />
            </motion.div>
          </AnimatePresence>

          {/* Expand Fullscreen Indicator */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsLightboxOpen(true);
            }}
            aria-label="View Fullscreen"
            className="absolute right-3.5 top-3.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black shadow-sm backdrop-blur-md opacity-0 transition-all duration-200 hover:bg-black hover:text-white group-hover:opacity-100"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {/* Navigation Arrows (if > 1 image) */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black shadow-md backdrop-blur-md opacity-0 transition-all duration-200 hover:bg-black hover:text-white group-hover:opacity-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-black shadow-md backdrop-blur-md opacity-0 transition-all duration-200 hover:bg-black hover:text-white group-hover:opacity-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Image Counter Badge */}
          {images.length > 1 && (
            <div className="absolute bottom-3.5 right-3.5 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium tracking-widest text-white backdrop-blur-sm">
              {safeIndex + 1} / {images.length}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-lg p-4 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close modal"
            className="absolute right-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-black"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative h-[85vh] w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[safeIndex] || images[0]}
              alt={`Full size image ${safeIndex + 1}`}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-black"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white hover:text-black"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
