"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: Category[];
  brands: Brand[];
}

const PRICE_PRESETS = [
  { label: "Under ৳1,000", min: "0", max: "1000" },
  { label: "৳1,000 – ৳2,500", min: "1000", max: "2500" },
  { label: "৳2,500 – ৳5,000", min: "2500", max: "5000" },
  { label: "Over ৳5,000", min: "5000", max: "" },
];

export function ProductFilters({ categories, brands }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category");
  const currentBrand = searchParams.get("brand");
  const currentMinPrice = searchParams.get("minPrice");
  const currentMaxPrice = searchParams.get("maxPrice");

  const [customMin, setCustomMin] = useState(currentMinPrice || "");
  const [customMax, setCustomMax] = useState(currentMaxPrice || "");

  // Update query params
  const updateQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, val]) => {
        if (val === null || val === "") {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      });
      router.push(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const toggleCategory = (slug: string) => {
    if (currentCategory === slug) {
      updateQuery({ category: null });
    } else {
      updateQuery({ category: slug });
    }
  };

  const toggleBrand = (slug: string) => {
    if (currentBrand === slug) {
      updateQuery({ brand: null });
    } else {
      updateQuery({ brand: slug });
    }
  };

  const applyPricePreset = (min: string, max: string) => {
    if (currentMinPrice === min && currentMaxPrice === max) {
      updateQuery({ minPrice: null, maxPrice: null });
    } else {
      updateQuery({ minPrice: min || null, maxPrice: max || null });
    }
  };

  const handleCustomPriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateQuery({
      minPrice: customMin ? customMin : null,
      maxPrice: customMax ? customMax : null,
    });
  };

  const clearAllFilters = () => {
    router.push("/products");
  };

  const hasActiveFilters = Boolean(
    currentCategory || currentBrand || currentMinPrice || currentMaxPrice
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#1A1A1A]">
          Refine Search
        </h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-auto p-0 text-xs font-medium text-[#C9A86A] hover:text-[#1A1A1A] hover:bg-transparent"
          >
            Reset all
          </Button>
        )}
      </div>

      {/* Active Filter Badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {currentCategory && (
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-800">
              <span className="capitalize">
                {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
              </span>
              <button
                type="button"
                onClick={() => updateQuery({ category: null })}
                className="hover:text-red-500"
                aria-label="Remove category filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {currentBrand && (
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-800">
              <span>{brands.find((b) => b.slug === currentBrand)?.name || currentBrand}</span>
              <button
                type="button"
                onClick={() => updateQuery({ brand: null })}
                className="hover:text-red-500"
                aria-label="Remove brand filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {(currentMinPrice || currentMaxPrice) && (
            <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs text-gray-800">
              <span>
                ৳{currentMinPrice || "0"} - {currentMaxPrice ? `৳${currentMaxPrice}` : "Above"}
              </span>
              <button
                type="button"
                onClick={() => updateQuery({ minPrice: null, maxPrice: null })}
                className="hover:text-red-500"
                aria-label="Remove price filter"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      <Accordion
        type="multiple"
        defaultValue={["category", "brand", "price"]}
        className="w-full space-y-2"
      >
        {/* Categories */}
        {categories.length > 0 && (
          <AccordionItem value="category" className="border-b border-gray-100">
            <AccordionTrigger className="py-3 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] hover:no-underline">
              Category
            </AccordionTrigger>
            <AccordionContent>
              <div className="max-h-56 space-y-2 overflow-y-auto pr-2 pt-1 scrollbar-thin">
                {categories.map((cat) => {
                  const active = currentCategory === cat.slug;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => toggleCategory(cat.slug)}
                      className={`flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-xs transition-colors ${
                        active
                          ? "bg-black text-white font-medium"
                          : "text-gray-600 hover:bg-gray-100 hover:text-black"
                      }`}
                    >
                      <span>{cat.name}</span>
                      {active && <Check className="h-3 w-3" />}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Brands */}
        {brands.length > 0 && (
          <AccordionItem value="brand" className="border-b border-gray-100">
            <AccordionTrigger className="py-3 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] hover:no-underline">
              Brand
            </AccordionTrigger>
            <AccordionContent>
              <div className="max-h-56 space-y-2 overflow-y-auto pr-2 pt-1 scrollbar-thin">
                {brands.map((brand) => {
                  const active = currentBrand === brand.slug;
                  return (
                    <div
                      key={brand.id}
                      onClick={() => toggleBrand(brand.slug)}
                      className={`flex cursor-pointer items-center justify-between rounded px-2 py-1.5 text-xs transition-colors ${
                        active
                          ? "bg-black text-white font-medium"
                          : "text-gray-600 hover:bg-gray-100 hover:text-black"
                      }`}
                    >
                      <span>{brand.name}</span>
                      {active && <Check className="h-3 w-3" />}
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* Price Range */}
        <AccordionItem value="price" className="border-b-0">
          <AccordionTrigger className="py-3 text-xs font-semibold uppercase tracking-wider text-[#1A1A1A] hover:no-underline">
            Price (BDT ৳)
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              <div className="space-y-1.5">
                {PRICE_PRESETS.map((preset, idx) => {
                  const active =
                    currentMinPrice === preset.min &&
                    (preset.max ? currentMaxPrice === preset.max : !currentMaxPrice);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPricePreset(preset.min, preset.max)}
                      className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs transition-colors ${
                        active
                          ? "bg-black text-white font-medium"
                          : "text-gray-600 hover:bg-gray-100 hover:text-black"
                      }`}
                    >
                      <span>{preset.label}</span>
                      {active && <Check className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>

              {/* Custom Min / Max Input */}
              <form onSubmit={handleCustomPriceSubmit} className="pt-2">
                <span className="mb-2 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  Custom Range
                </span>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-2 top-1.5 text-[11px] text-gray-400">৳</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={customMin}
                      onChange={(e) => setCustomMin(e.target.value)}
                      className="w-full rounded border border-gray-200 py-1 pl-5 pr-1 text-xs focus:border-black focus:outline-none"
                    />
                  </div>
                  <span className="text-xs text-gray-400">-</span>
                  <div className="relative flex-1">
                    <span className="absolute left-2 top-1.5 text-[11px] text-gray-400">৳</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={customMax}
                      onChange={(e) => setCustomMax(e.target.value)}
                      className="w-full rounded border border-gray-200 py-1 pl-5 pr-1 text-xs focus:border-black focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="rounded bg-black px-2.5 py-1 text-xs font-medium text-white transition-colors hover:bg-[#C9A86A]"
                  >
                    Go
                  </button>
                </div>
              </form>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
