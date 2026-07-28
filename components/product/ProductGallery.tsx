"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductGalleryProps {
  images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-[3/4] w-full bg-zinc-100 flex items-center justify-center">
        <span className="text-zinc-400">No Image Available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4">
      {/* Thumbnails */}
      <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto max-h-[600px] scrollbar-hide shrink-0">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`relative w-20 h-24 shrink-0 overflow-hidden border-2 transition-all ${
              currentIndex === idx ? 'border-black' : 'border-transparent opacity-70 hover:opacity-100'
            }`}
          >
            <img src={img} alt={`Thumbnail ${idx + 1}`} className="object-cover w-full h-full" />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative aspect-[3/4] w-full bg-zinc-50 overflow-hidden flex-1">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Product image ${currentIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full object-cover object-center"
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
