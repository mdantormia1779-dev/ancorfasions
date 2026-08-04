"use client";

import { useState } from "react";
import { ProductActions } from "./product-actions";
import { Ruler } from "lucide-react";

interface Variant {
  id: string;
  price: number | null;
  sale_price: number | null;
  stock_quantity: number;
  variant_attribute_values?: {
    attribute_values: {
      id: string;
      value: string;
      attributes: {
        id: string;
        name: string;
      };
    };
  }[];
}

interface ProductVariantSelectorProps {
  productId: string;
  baseStockQuantity: number;
  variants: Variant[];
  productName?: string;
  productPrice?: number;
  productImage?: string;
}

export function ProductVariantSelector({
  productId,
  baseStockQuantity,
  variants,
  productName,
  productPrice,
  productImage,
}: ProductVariantSelectorProps) {
  // Simple implementation: Assuming 'Size' is the main varying attribute for now.
  // We can group by attribute name if there are multiple (Color, Size).

  // Flatten to find all sizes
  const sizes =
    variants
      ?.map((v) => {
        const sizeAttr = v.variant_attribute_values?.find(
          (val) =>
            val.attribute_values?.attributes?.name?.toLowerCase() === "size"
        );
        return {
          variantId: v.id,
          size: sizeAttr?.attribute_values?.value,
          stock: v.stock_quantity,
        };
      })
      .filter((s) => s.size) || [];

  const [selectedVariantId, setSelectedVariantId] = useState<
    string | undefined
  >(sizes.find((s) => s.stock > 0)?.variantId);

  const currentVariant = variants?.find((v) => v.id === selectedVariantId);
  const isOutOfStock = currentVariant
    ? currentVariant.stock_quantity <= 0
    : baseStockQuantity <= 0;

  return (
    <div className="mt-8 border-t border-zinc-200 pt-8">
      {sizes.length > 0 && (
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-900">Select Size</h3>
            <button className="flex items-center gap-1 text-sm text-zinc-500 underline hover:text-black">
              <Ruler className="h-4 w-4" /> Size Guide
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
            {sizes.map(({ variantId, size, stock }) => {
              const isSelected = selectedVariantId === variantId;
              const isAvailable = stock > 0;
              return (
                <button
                  key={variantId}
                  onClick={() => setSelectedVariantId(variantId)}
                  disabled={!isAvailable}
                  className={`relative flex h-12 w-full items-center justify-center border text-sm font-medium uppercase tracking-wider transition-colors ${
                    isSelected
                      ? "border-black bg-black text-white"
                      : isAvailable
                        ? "border-gray-200 bg-white text-gray-900 hover:border-black"
                        : "cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400"
                  }`}
                >
                  {size}
                  {!isAvailable && (
                    <svg
                      className="absolute inset-0 h-full w-full stroke-gray-300"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                      strokeWidth="1"
                    >
                      <line x1="0" y1="100" x2="100" y2="0" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-10">
        <ProductActions
          productId={productId}
          selectedVariantId={selectedVariantId}
          disabled={isOutOfStock}
          productName={productName}
          productPrice={productPrice}
          productImage={productImage}
        />
      </div>
    </div>
  );
}
