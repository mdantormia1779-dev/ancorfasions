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
  DropdownMenuTrigger 
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
  
  const category = typeof params.category === 'string' ? params.category : undefined;
  const search = typeof params.q === 'string' ? params.q : undefined;
  const sort = typeof params.sort === 'string' ? params.sort : undefined;
  
  let sortBy: ProductListParams['sortBy'] = 'newest';
  if (sort === 'price_asc' || sort === 'price_desc' || sort === 'rating') {
    sortBy = sort;
  }

  // Fetch data in parallel
  const [{ data: products, count }, categories] = await Promise.all([
    CatalogService.getProducts({ category, search, sortBy, limit: 12 }),
    CatalogService.getCategories()
  ]);

  return (
    <div className="container py-8 md:py-12">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">All Products</h1>
          <p className="text-muted-foreground mt-1">Showing {products.length} {count ? `of ${count}` : ''} results</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Mobile Filter Trigger */}
          <Sheet>
            <SheetTrigger>
              <Button variant="outline" className="md:hidden flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto pt-10">
              <ProductFilters categories={categories} brands={[]} />
            </SheetContent>
          </Sheet>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="flex items-center gap-2 w-full md:w-auto justify-between">
                Sort by: {sort === 'price_asc' ? 'Price: Low to High' : sort === 'price_desc' ? 'Price: High to Low' : sort === 'rating' ? 'Top Rated' : 'Newest'} <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem>
                <Link href={`/products?${new URLSearchParams({ ...params, sort: 'newest' }).toString()}`}>Newest Arrivals</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={`/products?${new URLSearchParams({ ...params, sort: 'price_asc' }).toString()}`}>Price: Low to High</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={`/products?${new URLSearchParams({ ...params, sort: 'price_desc' }).toString()}`}>Price: High to Low</Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link href={`/products?${new URLSearchParams({ ...params, sort: 'rating' }).toString()}`}>Top Rated</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {/* Sidebar Desktop */}
        <aside className="hidden md:block md:col-span-1 border-r pr-6 min-h-[500px]">
          <Suspense fallback={<div className="space-y-4"><div className="h-4 bg-muted animate-pulse rounded w-1/2"></div><div className="h-32 bg-muted animate-pulse rounded"></div></div>}>
            <ProductFilters categories={categories} brands={[]} />
          </Suspense>
        </aside>

        {/* Product Grid */}
        <div className="md:col-span-3 lg:col-span-4">
          {products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg border-dashed bg-muted/20">
              <h3 className="text-xl font-semibold mb-2">No products found</h3>
              <p className="text-muted-foreground max-w-md">
                We couldn't find any products matching your current filters. Try adjusting your search criteria.
              </p>
            </div>
          )}
          
          {/* Pagination Placeholder */}
          {count && count > 12 && (
            <div className="mt-12 flex justify-center">
              <Button variant="outline" className="px-8">Load More</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
