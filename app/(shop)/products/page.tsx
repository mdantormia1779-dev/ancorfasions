import { Suspense } from "react";
import { ProductListParams } from "@/repositories/catalog.repository";
import { CatalogService } from "@/lib/services/catalog.service";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/product-filters";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export const metadata = {
  title: "All Products | Anchor Fashion",
  description: "Browse our entire collection of premium apparel.",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const category =
    typeof params.category === "string" ? params.category : undefined;
  const search = typeof params.q === "string" ? params.q : undefined;
  const sort = typeof params.sort === "string" ? params.sort : undefined;

  let sortBy: ProductListParams["sortBy"] = "newest";
  if (sort === "price_asc" || sort === "price_desc" || sort === "rating") {
    sortBy = sort;
  }

  // Fetch data in parallel
  const [{ data: products, count }, categories] = await Promise.all([
    CatalogService.getProducts({ category, search, sortBy, limit: 12 }),
    CatalogService.getCategories(),
  ]);

  return (
    <div className="container py-8 md:py-12">
      {/* Header Area */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
          <p className="mt-1 text-muted-foreground">
            Showing {products.length} {count ? `of ${count}` : ""} results
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Trigger */}
          <Sheet>
            <SheetTrigger>
              <Button
                variant="outline"
                className="flex items-center gap-2 md:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[300px] overflow-y-auto pt-10 sm:w-[400px]"
            >
              <ProductFilters categories={categories} brands={[]} />
            </SheetContent>
          </Sheet>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="outline"
                className="flex w-full items-center justify-between gap-2 md:w-auto"
              >
                Sort by:{" "}
                {sort === "price_asc"
                  ? "Price: Low to High"
                  : sort === "price_desc"
                    ? "Price: High to Low"
                    : sort === "rating"
                      ? "Top Rated"
                      : "Newest"}{" "}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem>
                <Link
                  href={`/products?${new URLSearchParams({ ...params, sort: "newest" }).toString()}`}
                >
                  Newest Arrivals
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={`/products?${new URLSearchParams({ ...params, sort: "price_asc" }).toString()}`}
                >
                  Price: Low to High
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={`/products?${new URLSearchParams({ ...params, sort: "price_desc" }).toString()}`}
                >
                  Price: High to Low
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={`/products?${new URLSearchParams({ ...params, sort: "rating" }).toString()}`}
                >
                  Top Rated
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
        {/* Sidebar Desktop */}
        <aside className="hidden min-h-[500px] border-r pr-6 md:col-span-1 md:block">
          <Suspense
            fallback={
              <div className="space-y-4">
                <div className="h-4 w-1/2 animate-pulse rounded bg-muted"></div>
                <div className="h-32 animate-pulse rounded bg-muted"></div>
              </div>
            }
          >
            <ProductFilters categories={categories} brands={[]} />
          </Suspense>
        </aside>

        {/* Product Grid */}
        <div className="md:col-span-3 lg:col-span-4">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 py-20 text-center">
              <h3 className="mb-2 text-xl font-semibold">No products found</h3>
              <p className="max-w-md text-muted-foreground">
                We couldn't find any products matching your current filters. Try
                adjusting your search criteria.
              </p>
            </div>
          )}

          {/* Pagination Placeholder */}
          {count && count > 12 && (
            <div className="mt-12 flex justify-center">
              <Button variant="outline" className="px-8">
                Load More
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
