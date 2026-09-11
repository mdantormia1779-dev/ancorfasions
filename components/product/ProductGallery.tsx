"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ProductGalleryProps {
  images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // When images array changes (e.g. variant selection), reset index to 0
  useEffect(() => {
    setCurrentIndex(0);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-[3/4] w-full items-center justify-center bg-zinc-100">
        <span className="text-zinc-400">No Image Available</span>
      </div>
    );
  }

  const safeIndex = Math.min(currentIndex, Math.max(0, images.length - 1));

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {/* Thumbnails */}
      <div className="scrollbar-hide flex max-h-[600px] shrink-0 gap-3 overflow-x-auto md:flex-col md:overflow-y-auto">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`relative h-24 w-20 shrink-0 overflow-hidden transition-all duration-300 ${
              safeIndex === idx
                ? "border-b-2 border-black opacity-100"
                : "border-b-2 border-transparent opacity-50 hover:opacity-100"
            }`}
          >
            <Image
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              fill
              sizes="80px"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div
        className="group relative aspect-[4/5] w-full flex-1 cursor-zoom-in overflow-hidden bg-[#F7F7F7]"
        onMouseMove={(e) => {
          const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
          const x = (e.clientX - left) / width;
          const y = (e.clientY - top) / height;
          e.currentTarget.style.setProperty('--mouse-x', `${x * 100}%`);
          e.currentTarget.style.setProperty('--mouse-y', `${y * 100}%`);
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={safeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 transition-transform duration-300 ease-out group-hover:scale-125"
            style={{ transformOrigin: 'var(--mouse-x, 50%) var(--mouse-y, 50%)' }}
          >
            <Image
              src={images[safeIndex] || images[0]}
              alt={`Product image ${safeIndex + 1}`}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
