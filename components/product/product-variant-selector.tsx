"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
}

export function ProductVariantSelector({ productId, baseStockQuantity, variants }: ProductVariantSelectorProps) {
  // Simple implementation: Assuming 'Size' is the main varying attribute for now.
  // We can group by attribute name if there are multiple (Color, Size).
  
  // Flatten to find all sizes
  const sizes = variants?.map(v => {
    const sizeAttr = v.variant_attribute_values?.find(val => val.attribute_values?.attributes?.name?.toLowerCase() === 'size');
    return {
      variantId: v.id,
      size: sizeAttr?.attribute_values?.value,
      stock: v.stock_quantity
    };
  }).filter(s => s.size) || [];

  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    sizes.find(s => s.stock > 0)?.variantId
  );

  const currentVariant = variants?.find(v => v.id === selectedVariantId);
  const isOutOfStock = currentVariant ? currentVariant.stock_quantity <= 0 : baseStockQuantity <= 0;

  return (
    <div className="mt-8 border-t border-zinc-200 pt-8">
      {sizes.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-900">Select Size</h3>
            <button className="text-sm text-zinc-500 underline flex items-center gap-1 hover:text-black">
              <Ruler className="w-4 h-4" /> Size Guide
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {sizes.map(({ variantId, size, stock }) => (
              <Button 
                key={variantId} 
                variant={selectedVariantId === variantId ? "default" : "outline"} 
                className={`h-12 w-full text-sm font-medium uppercase tracking-wider ${stock <= 0 ? 'opacity-50 line-through' : ''}`}
                onClick={() => setSelectedVariantId(variantId)}
                disabled={stock <= 0}
              >
                {size}
              </Button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <ProductActions 
          productId={productId} 
          selectedVariantId={selectedVariantId}
          disabled={isOutOfStock} 
        />
      </div>
    </div>
  );
}
