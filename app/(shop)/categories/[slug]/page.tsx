import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProducts } from "@/features/commerce/actions/products";
import {
  getCategoryBySlug,
  getCategories,
  getBrands,
} from "@/features/commerce/actions/categories";
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
import { generateMetadata as getSEOMetadata } from "@/features/commerce/utils/seo";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return { title: "Category Not Found" };

  return getSEOMetadata({
    title: category.name,
    description: `Shop the latest ${category.name} at Anchor Fashion.`,
    url: `/categories/${category.slug}`,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const category = await getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  // Fetch data in parallel
  const [products, categories, brands] = await Promise.all([
    getProducts({ categoryId: category.id }),
    getCategories(),
    getBrands(),
  ]);

  return (
    <div className="container py-8 md:py-12">
      {/* Category Header */}
      <div className="mb-8 flex min-h-[200px] flex-col items-center justify-center rounded-xl bg-muted p-8 text-center">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">
          {category.name}
        </h1>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          Explore our collection of premium {category.name.toLowerCase()}.
          Curated for the modern professional seeking comfort, style, and
          durability.
        </p>
      </div>

      {/* Header Area */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="font-medium text-muted-foreground">
            Showing {products.length} products
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
              <ProductFilters categories={categories} brands={brands} />
            </SheetContent>
          </Sheet>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="outline"
                className="flex w-full items-center justify-between gap-2 md:w-auto"
              >
                Sort by: Featured <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem>Featured</DropdownMenuItem>
              <DropdownMenuItem>Newest Arrivals</DropdownMenuItem>
              <DropdownMenuItem>Price: Low to High</DropdownMenuItem>
              <DropdownMenuItem>Price: High to Low</DropdownMenuItem>
              <DropdownMenuItem>Top Rated</DropdownMenuItem>
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
            <ProductFilters categories={categories} brands={brands} />
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
                We couldn't find any products in this category at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
