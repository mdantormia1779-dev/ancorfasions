"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductGalleryProps {
  images: string[];
}

export function ProductGallery({ images }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-[3/4] w-full items-center justify-center bg-zinc-100">
        <span className="text-zinc-400">No Image Available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      {/* Thumbnails */}
      <div className="scrollbar-hide flex max-h-[600px] shrink-0 gap-2 overflow-x-auto md:flex-col md:overflow-y-auto">
        {images.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`relative h-24 w-20 shrink-0 overflow-hidden border-2 transition-all ${
              currentIndex === idx
                ? "border-black"
                : "border-transparent opacity-70 hover:opacity-100"
            }`}
          >
            <img
              src={img}
              alt={`Thumbnail ${idx + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image */}
      <div className="relative aspect-[3/4] w-full flex-1 overflow-hidden bg-zinc-50">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`Product image ${currentIndex + 1}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full object-cover object-center"
          />
        </AnimatePresence>
      </div>
    </div>
  );
}
