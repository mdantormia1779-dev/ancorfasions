"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Sparkles, Tag, ArrowRight } from "lucide-react";
import { PromotionRecord } from "@/lib/repositories/marketing/promotion.repository";
import { getActivePromotionAction } from "@/actions/marketing.actions";

interface PromotionPopupBannerProps {
  initialPromotion?: PromotionRecord | null;
}

export function PromotionPopupBanner({ initialPromotion }: PromotionPopupBannerProps) {
  const [promo, setPromo] = useState<PromotionRecord | null>(initialPromotion || null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadActivePromotion() {
      if (!initialPromotion) {
        try {
          const res = await getActivePromotionAction();
          if (res.success && res.data && isMounted) {
            setPromo(res.data);
          }
        } catch (err) {
          console.warn("[PromotionPopupBanner] Failed to load promotion:", err);
        }
      }
    }

    loadActivePromotion();
    return () => {
      isMounted = false;
    };
  }, [initialPromotion]);

  useEffect(() => {
    if (!promo || !promo.is_active || promo.show_popup === false) return;

    // Check if user already dismissed or interacted with this promotion in this session
    const storageKey = `seen_promo_popup_${promo.id}`;
    if (typeof window !== "undefined") {
      const alreadySeen = sessionStorage.getItem(storageKey);
      if (alreadySeen) return;
    }

    const delaySeconds = promo.popup_delay && promo.popup_delay > 0 ? promo.popup_delay : 5;
    const timer = setTimeout(() => {
      if (!hasInteracted) {
        setIsOpen(true);
      }
    }, delaySeconds * 1000);

    return () => clearTimeout(timer);
  }, [promo, hasInteracted]);

  const handleClose = () => {
    setIsOpen(false);
    setHasInteracted(true);
    if (promo?.id && typeof window !== "undefined") {
      sessionStorage.setItem(`seen_promo_popup_${promo.id}`, "true");
    }
  };

  const handleBannerClick = () => {
    setIsOpen(false);
    setHasInteracted(true);
    if (promo?.id && typeof window !== "undefined") {
      sessionStorage.setItem(`seen_promo_popup_${promo.id}`, "true");
    }
  };

  if (!isOpen || !promo) return null;

  const targetLink = promo.banner_link && promo.banner_link.trim() !== "" ? promo.banner_link : "/products";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-zinc-100 animate-in zoom-in-95 duration-300 text-zinc-900"
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-banner-title"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute right-3 top-3 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black transition-colors"
          aria-label="Close promotion banner"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Promo Image */}
        {promo.banner_url ? (
          <Link
            href={targetLink}
            onClick={handleBannerClick}
            className="relative block w-full aspect-[16/9] sm:aspect-[16/8] overflow-hidden bg-zinc-100 group cursor-pointer"
          >
            <Image
              src={promo.banner_url}
              alt={promo.name}
              fill
              priority
              sizes="(max-width: 640px) 100vw, 512px"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A86A] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow">
                <Tag className="h-3.5 w-3.5" />
                Special Offer
              </span>
              <span className="text-xl sm:text-2xl font-black text-white drop-shadow">
                {promo.discount_percentage}% OFF
              </span>
            </div>
          </Link>
        ) : (
          <div className="relative bg-gradient-to-br from-zinc-900 via-neutral-900 to-black p-6 sm:p-8 text-white">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#C9A86A] px-3 py-1 text-xs font-bold uppercase tracking-wider text-white mb-3">
              <Sparkles className="h-3.5 w-3.5" />
              Exclusive Offer
            </div>
            <h2 id="promo-banner-title" className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {promo.name}
            </h2>
            <div className="mt-2 text-4xl sm:text-5xl font-black text-[#C9A86A]">
              {promo.discount_percentage}% OFF
            </div>
          </div>
        )}

        {/* Modal Content & Action */}
        <div className="p-5 sm:p-6 space-y-4">
          <div>
            <div className="flex items-center gap-2 text-[#C9A86A] text-xs font-bold uppercase tracking-widest">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Limited Time Promotion</span>
            </div>
            <h3 className="mt-1 text-lg sm:text-xl font-bold text-zinc-900 leading-snug">
              {promo.name}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-600 leading-relaxed">
              Enjoy an automatic{" "}
              <strong className="text-zinc-900 font-semibold">{promo.discount_percentage}% discount</strong> applied
              directly to all qualifying products storewide. Don&apos;t miss out!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
            <Link
              href={targetLink}
              onClick={handleBannerClick}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-6 py-3 text-xs sm:text-sm font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-black hover:shadow-xl active:scale-98"
            >
              <span>Explore Collection</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-3 text-xs font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
