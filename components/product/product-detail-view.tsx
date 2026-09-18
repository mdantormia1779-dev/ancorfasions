"use client";

import { useState, useMemo, useCallback } from "react";
import { ProductGallery } from "@/components/product/ProductGallery";
import {
  ProductVariantSelector,
  VariantChangeInfo,
  FlashSaleInfo,
} from "@/components/product/product-variant-selector";
import { FloatingPurchaseCard } from "@/components/product/floating-purchase-card";
import { ProductViewTracker } from "@/components/product/product-view-tracker";
import { ProductReviews } from "@/components/product/product-reviews";
import { ProductCard } from "@/components/product/product-card";
import { Truck, RefreshCw, ShieldCheck, Ruler, Info, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { Jost } from "next/font/google";

const jost = Jost({ subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export interface ProductDetailViewProps {
  product: any;
  flashSale?: FlashSaleInfo | null;
  reviews?: any[];
  relatedProducts?: any[];
}

export function ProductDetailView({
  product,
  flashSale = null,
  reviews = [],
  relatedProducts = [],
}: ProductDetailViewProps) {
  // Base gallery images from product_media
  const baseImages = useMemo(() => {
    const media = product.product_media || [];
    if (media.length > 0) {
      return [...media]
        .sort((a: any, b: any) => (a.display_order ?? 0) - (b.display_order ?? 0))
        .map((m: any) => m.url);
    }
    return ["/images/placeholder.webp"];
  }, [product.product_media]);

  // Dynamic state governed by variant selection
  const [currentGalleryImages, setCurrentGalleryImages] = useState<string[]>(baseImages);
  const [currentPrice, setCurrentPrice] = useState<number>(
    flashSale?.flash_price ?? product.sale_price ?? product.base_price
  );
  const [comparePrice, setComparePrice] = useState<number | null>(
    flashSale || product.sale_price ? product.base_price : null
  );
  const [currentSku, setCurrentSku] = useState<string>(product.sku || "");
  const initialStock = product.total_available_stock ?? (product.is_in_stock ? 10 : 0);
  const [currentStock, setCurrentStock] = useState<number>(initialStock);
  const [isOutOfStock, setIsOutOfStock] = useState<boolean>(
    !product.is_in_stock || initialStock <= 0
  );
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [selectedVariantLabel, setSelectedVariantLabel] = useState<string>("");

  // Callback when variant changes in ProductVariantSelector
  const handleVariantChange = useCallback(
    (info: VariantChangeInfo) => {
      setCurrentPrice(info.price);
      setComparePrice(info.compareAtPrice);
      setCurrentSku(info.sku);
      setCurrentStock(info.stock);
      setIsOutOfStock(info.isOutOfStock);
      setSelectedVariantId(info.variant?.id || null);

      if (info.images && info.images.length > 0) {
        setCurrentGalleryImages(info.images);
      } else {
        setCurrentGalleryImages(baseImages);
      }

      if (info.variant) {
        const attrs = info.variant.attributes;
        if (attrs && typeof attrs === "object") {
          const label = Object.entries(attrs)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" / ");
          setSelectedVariantLabel(label);
        } else {
          setSelectedVariantLabel(info.variant.sku || "Standard");
        }
      } else {
        setSelectedVariantLabel("");
      }
    },
    [baseImages]
  );

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / totalReviews
      : product.average_rating || 0;

  const isLowStock = !isOutOfStock && currentStock > 0 && currentStock <= 5;
  const isFlashActive =
    Boolean(flashSale) &&
    (flashSale?.stock_allocated || 0) > (flashSale?.stock_sold || 0);

  return (
    <div className="min-h-screen bg-white pb-20 pt-4">
      {/* Analytics & View Tracking */}
      <ProductViewTracker product={product} />

      {/* Floating Purchase Card for Desktop Viewport */}
      <FloatingPurchaseCard
        productId={product.id}
        productName={product.name}
        productPrice={currentPrice}
        compareAtPrice={comparePrice}
        productImage={currentGalleryImages[0] || baseImages[0]}
        selectedVariantId={selectedVariantId}
        selectedVariantSku={currentSku}
        selectedVariantLabel={selectedVariantLabel}
        isOutOfStock={isOutOfStock}
      />

      <div className="container mx-auto px-4 py-6 md:px-6 md:py-12">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumbs"
          className="mb-8 flex items-center text-[10px] uppercase tracking-[0.2em] text-gray-400"
        >
          <Link href="/" className="transition-colors hover:text-black">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="transition-colors hover:text-black">
            Products
          </Link>
          {product.categories && (
            <>
              <span className="mx-2">/</span>
              <Link
                href={`/products?category=${product.categories.slug}`}
                className="transition-colors hover:text-black"
              >
                {product.categories.name}
              </Link>
            </>
          )}
          <span className="mx-2">/</span>
          <span className="truncate max-w-[200px] sm:max-w-none text-black font-medium">
            {product.name}
          </span>
        </nav>

        {/* Main PDP Grid */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Interactive Product Gallery */}
          <div className="relative w-full lg:col-span-7">
            <ProductGallery images={currentGalleryImages} />
          </div>

          {/* Right Column: Sticky Product Details & Variant Selection */}
          <div className="sticky top-20 flex flex-col lg:col-span-5">
            {/* Header: Brand & Title */}
            <div className="border-b border-gray-100 pb-6">
              {product.brands && (
                <Link
                  href={`/products?brand=${product.brands.slug}`}
                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500 hover:text-black transition-colors"
                >
                  {product.brands.name}
                </Link>
              )}
              <h1
                className={`${jost.className} mb-4 text-3xl font-light leading-[1.1] tracking-tight text-[#1A1A1A] md:text-4xl lg:text-5xl`}
              >
                {product.name}
              </h1>

              {/* Price & Stock Badge Display */}
              <div className="mt-4 flex flex-wrap items-baseline gap-4">
                <span className="text-3xl font-semibold tracking-tight text-[#1A1A1A]">
                  {formatCurrency(currentPrice)}
                </span>
                {comparePrice && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatCurrency(comparePrice)}
                  </span>
                )}
                {isFlashActive && (
                  <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-800">
                    <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                    Flash Sale
                  </span>
                )}

                <div className="ml-auto">
                  {isOutOfStock ? (
                    <span className="border border-zinc-300 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                      Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="border border-amber-500 bg-amber-50/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-amber-700">
                      Low Stock ({currentStock} left)
                    </span>
                  ) : (
                    <span className="border border-[#1A1A1A] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">
                      In Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Dynamic SKU & Rating Summary */}
              <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                {currentSku && (
                  <span className="uppercase tracking-wider">
                    SKU: <strong className="text-gray-900">{currentSku}</strong>
                  </span>
                )}
                {averageRating > 0 && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < Math.floor(averageRating)
                              ? "fill-current"
                              : "fill-muted text-gray-200"
                          }`}
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      ))}
                    </div>
                    <span className="font-medium text-gray-700">
                      {averageRating.toFixed(1)} ({totalReviews})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Variant Selector + Dynamic Controls + Add to Cart */}
            <div className="my-8">
              <ProductVariantSelector
                productId={product.id}
                baseStockQuantity={product.total_available_stock ?? 0}
                variants={product.variants || []}
                productName={product.name}
                productPrice={product.base_price}
                productSalePrice={product.sale_price}
                productSku={product.sku}
                productImages={baseImages}
                productMedia={product.product_media || []}
                flashSale={flashSale}
                sizeCharts={product.size_charts || []}
                onVariantChange={handleVariantChange}
              />
            </div>

            {/* Accordions: Description, Shipping & Care */}
            <div className="divide-y divide-gray-100 border-t border-gray-100">
              <details className="group" open>
                <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-xs font-semibold uppercase tracking-widest text-[#1A1A1A]">
                  <span>Product Details</span>
                  <span className="transition-transform duration-300 group-open:rotate-180">
                    <svg
                      fill="none"
                      height="18"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="18"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                <div className="space-y-4 pb-6 text-sm leading-relaxed text-gray-600">
                  <p>
                    {product.description ||
                      product.short_description ||
                      "Crafted from premium fabrics, this design combines timeless silhouette with modern craftsmanship for everyday versatility."}
                  </p>
                  {(product.material || product.care_instructions) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                      {product.material && (
                        <div>
                          <span className="font-semibold text-gray-900">Material:</span>{" "}
                          <span>{product.material}</span>
                        </div>
                      )}
                      {product.care_instructions && (
                        <div>
                          <span className="font-semibold text-gray-900">Care:</span>{" "}
                          <span>{product.care_instructions}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </details>

              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-xs font-semibold uppercase tracking-widest text-[#1A1A1A]">
                  <span>Delivery &amp; Easy Returns</span>
                  <span className="transition-transform duration-300 group-open:rotate-180">
                    <svg
                      fill="none"
                      height="18"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="18"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                <div className="space-y-3 pb-6 text-sm text-gray-600">
                  <div className="flex items-center gap-3">
                    <Truck className="h-4 w-4 text-[#1A1A1A] shrink-0" strokeWidth={1.5} />
                    <span>Express Delivery across Bangladesh (24-48 hours inside Dhaka)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <RefreshCw className="h-4 w-4 text-[#1A1A1A] shrink-0" strokeWidth={1.5} />
                    <span>7-Day Hassle-Free Exchange &amp; Return Policy on unworn pieces</span>
                  </div>
                </div>
              </details>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 sm:grid-cols-4">
              <div className="flex flex-col items-center text-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#1A1A1A]" strokeWidth={1.5} />
                <span className="text-[9px] uppercase tracking-widest text-gray-500">
                  Secure Checkout
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Ruler className="h-5 w-5 text-[#1A1A1A]" strokeWidth={1.5} />
                <span className="text-[9px] uppercase tracking-widest text-gray-500">
                  Tailored Fit
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <Info className="h-5 w-5 text-[#1A1A1A]" strokeWidth={1.5} />
                <span className="text-[9px] uppercase tracking-widest text-gray-500">
                  Premium Quality
                </span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <RefreshCw className="h-5 w-5 text-[#1A1A1A]" strokeWidth={1.5} />
                <span className="text-[9px] uppercase tracking-widest text-gray-500">
                  Easy Returns
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <ProductReviews
        productId={product.id}
        productName={product.name}
        averageRating={Number(averageRating.toFixed(1))}
        totalReviews={totalReviews}
        reviews={reviews}
      />

      {/* Related Products Carousel / Grid */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="border-t border-gray-100 py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <h2
              className={`${jost.className} mb-10 text-center text-2xl font-light tracking-tight text-[#1A1A1A] md:text-3xl`}
            >
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-2 md:grid-cols-4 md:gap-x-8">
              {relatedProducts.slice(0, 4).map((relProduct: any) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
