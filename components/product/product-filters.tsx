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

export function ProductFilters({ categories, brands }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Create a new URLSearchParams to manipulate the query
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const toggleFilter = (type: "category" | "brand", value: string) => {
    const current = searchParams.get(type)?.split(",") || [];
    const index = current.indexOf(value);

    let newFilter = [...current];
    if (index > -1) {
      newFilter.splice(index, 1);
    } else {
      newFilter.push(value);
    }

    router.push(`?${createQueryString(type, newFilter.join(","))}`);
  };

  const isChecked = (type: "category" | "brand", value: string) => {
    const current = searchParams.get(type)?.split(",") || [];
    return current.includes(value);
  };

  const clearFilters = () => {
    router.push(window.location.pathname);
  };

  const hasFilters = searchParams.get("category") || searchParams.get("brand");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Filters</h3>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-auto px-2 py-1 text-xs text-muted-foreground"
          >
            Clear all
          </Button>
        )}
      </div>

      <Accordion
        type="multiple"
        defaultValue={["category", "brand", "price"]}
        className="w-full"
      >
        <AccordionItem value="category" className="border-b-0">
          <AccordionTrigger className="py-3 text-base font-medium">
            Category
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category.slug}`}
                    checked={isChecked("category", category.slug)}
                    onCheckedChange={() =>
                      toggleFilter("category", category.slug)
                    }
                  />
                  <Label
                    htmlFor={`cat-${category.slug}`}
                    className="cursor-pointer text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="brand" className="border-b-0">
          <AccordionTrigger className="py-3 text-base font-medium">
            Brand
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-1">
              {brands.map((brand) => (
                <div key={brand.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`brand-${brand.slug}`}
                    checked={isChecked("brand", brand.slug)}
                    onCheckedChange={() => toggleFilter("brand", brand.slug)}
                  />
                  <Label
                    htmlFor={`brand-${brand.slug}`}
                    className="cursor-pointer text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {brand.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Placeholder for Price filter which would use Slider component */}
        <AccordionItem value="price" className="border-b-0">
          <AccordionTrigger className="py-3 text-base font-medium">
            Price Range
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-2 pb-2 pt-4">
              <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                <span>$0</span>
                <span>$1000+</span>
              </div>
              {/* In a real implementation, use Radix Slider here */}
              <div className="relative h-2 w-full rounded-full bg-muted">
                <div className="absolute left-0 top-0 h-full w-full rounded-full bg-primary opacity-30"></div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
