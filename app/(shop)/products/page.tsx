import { Suspense } from "react";
import { ProductListParams } from "@/repositories/catalog.repository";
import { CatalogService } from "@/lib/services/catalog.service";
import { ProductCard } from "@/components/product/product-card";
import { ProductFilters } from "@/components/product/product-filters";
import { InfiniteScrollGrid } from "@/components/product/infinite-scroll-grid";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { jost } from "@/lib/fonts";
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

export const revalidate = 60;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;

  const category =
    typeof params.category === "string" ? params.category : undefined;
  const brand =
    typeof params.brand === "string" ? params.brand : undefined;
  const search = typeof params.q === "string" ? params.q : undefined;
  const sort = typeof params.sort === "string" ? params.sort : undefined;
  const minPrice =
    typeof params.minPrice === "string" && !isNaN(Number(params.minPrice))
      ? Number(params.minPrice)
      : undefined;
  const maxPrice =
    typeof params.maxPrice === "string" && !isNaN(Number(params.maxPrice))
      ? Number(params.maxPrice)
      : undefined;

  let sortBy: ProductListParams["sortBy"] = "newest";
  if (sort === "price_asc" || sort === "price_desc" || sort === "rating") {
    sortBy = sort;
  }

  // Fetch data in parallel
  const [{ data: products, count }, rawCategories, rawBrands] = await Promise.all([
    CatalogService.getProducts({ category, brand, minPrice, maxPrice, search, sortBy, limit: 50 }),
    CatalogService.getCategories(),
    CatalogService.getBrands(),
  ]);

  // Clean real categories and brands (remove test/QA records)
  const categories: any[] = ((rawCategories as any[]) || []).filter(
    (c: any) =>
      !c.name?.toLowerCase().includes("test") &&
      !c.slug?.includes("test") &&
      !c.slug?.includes("qa") &&
      c.slug !== "jhkjhkj"
  );

  const brands: any[] = ((rawBrands as any[]) || []).filter(
    (b: any) =>
      !b.name?.toLowerCase().includes("test") &&
      !b.slug?.includes("test")
  );

  const currentCategoryName = categories.find((c: any) => c.slug === category)?.name;

  return (
    <div className={`${jost.className} container py-10 md:py-16`}>
      {/* Editorial Breadcrumbs */}
      <nav className="mb-6 flex items-center justify-center gap-2 text-xs uppercase tracking-widest text-gray-400">
        <Link href="/" className="hover:text-black transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link
          href="/products"
          className={category ? "hover:text-black transition-colors" : "text-black font-semibold"}
        >
          Shop
        </Link>
        {category && (
          <>
            <span>/</span>
            <span className="text-black font-semibold">
              {currentCategoryName || category}
            </span>
          </>
        )}
      </nav>

      {/* Header Area */}
      <div className="mb-10 flex flex-col items-center justify-center gap-3 text-center md:mb-14">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#C9A86A]">
          Exclusive Wardrobe
        </span>
        <h1 className="text-3xl font-light tracking-tight text-[#1A1A1A] sm:text-4xl md:text-5xl lg:text-6xl">
          {category ? currentCategoryName || "Curated Edit" : "Shop Collection"}
        </h1>
        <p className="text-xs text-gray-500 tracking-wide">
          Showing {products.length} {count && count > 50 ? `of ${count}` : ""} exquisite pieces
        </p>
      </div>

      {/* Quick Filter Chips */}
      <div className="mb-8 flex flex-wrap gap-2 md:justify-center">
        <Link
          href="/products"
          className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
            !category
              ? "bg-black text-white border-black shadow-sm"
              : "border-gray-200 text-gray-600 hover:border-black"
          }`}
        >
          All Pieces
        </Link>
        {categories.slice(0, 7).map((cat: any) => (
          <Link
            key={cat.slug}
            href={`/products?category=${cat.slug}`}
            className={`rounded-full border px-4 py-1.5 text-xs transition-colors ${
              category === cat.slug
                ? "bg-black text-white border-black shadow-sm"
                : "border-gray-200 text-gray-600 hover:border-black"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <div className="mb-8 flex flex-col justify-between gap-4 border-b border-gray-100 pb-4 md:flex-row md:items-end">
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            {products.length} {products.length === 1 ? "Product" : "Products"} Found
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Mobile Filter Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center gap-2 border-b border-transparent pb-1 text-xs font-semibold uppercase tracking-widest text-[#1A1A1A] transition-colors hover:border-black md:hidden">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="h-[80vh] overflow-y-auto rounded-t-2xl pt-10"
            >
              <ProductFilters categories={categories} brands={brands} />
            </SheetContent>
          </Sheet>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-between gap-2 border-b border-transparent pb-1 text-xs font-semibold uppercase tracking-widest text-[#1A1A1A] transition-colors hover:border-black outline-none">
              Sort by:{" "}
              {sort === "price_asc"
                ? "Price: Low to High"
                : sort === "price_desc"
                  ? "Price: High to Low"
                  : sort === "rating"
                    ? "Top Rated"
                    : "Newest"}{" "}
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem>
                <Link
                  href={`/products?${new URLSearchParams({ ...params, sort: "newest" }).toString()}`}
                  className="w-full"
                >
                  Newest Arrivals
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={`/products?${new URLSearchParams({ ...params, sort: "price_asc" }).toString()}`}
                  className="w-full"
                >
                  Price: Low to High
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={`/products?${new URLSearchParams({ ...params, sort: "price_desc" }).toString()}`}
                  className="w-full"
                >
                  Price: High to Low
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link
                  href={`/products?${new URLSearchParams({ ...params, sort: "rating" }).toString()}`}
                  className="w-full"
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
        <aside className="hidden min-h-[500px] pr-6 md:col-span-1 md:block">
          <Suspense
            fallback={
              <div className="space-y-4">
                <div className="h-4 w-1/2 animate-pulse bg-gray-100"></div>
                <div className="h-32 animate-pulse bg-gray-100"></div>
              </div>
            }
          >
            <ProductFilters categories={categories} brands={brands} />
          </Suspense>
        </aside>

        {/* Product Grid */}
        <div className="md:col-span-3 lg:col-span-4">
          {products.length > 0 ? (
            <InfiniteScrollGrid products={products} initialCount={12} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 py-20 text-center px-4">
              <h3 className="mb-2 text-lg font-medium text-gray-900">No matching pieces found</h3>
              <p className="max-w-md text-sm text-gray-500 mb-6">
                We couldn&apos;t find any products matching your current filters. Try
                broadening your search criteria or reset your filters.
              </p>
              <Link
                href="/products"
                className="rounded-full bg-black px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-[#C9A86A]"
              >
                Clear All Filters
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
