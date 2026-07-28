import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getProducts } from "@/features/commerce/actions/products";
import { getCategoryBySlug, getCategories, getBrands } from "@/features/commerce/actions/categories";
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
import { generateMetadata as getSEOMetadata } from "@/features/commerce/utils/seo";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug);
  if (!category) return { title: 'Category Not Found' };
  
  return getSEOMetadata({
    title: category.name,
    description: `Shop the latest ${category.name} at Anchor Fashion.`,
    url: `/categories/${category.slug}`
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
    getBrands()
  ]);

  return (
    <div className="container py-8 md:py-12">
      {/* Category Header */}
      <div className="bg-muted rounded-xl p-8 mb-8 text-center flex flex-col items-center justify-center min-h-[200px]">
        <h1 className="text-4xl font-bold tracking-tight mb-2">{category.name}</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Explore our collection of premium {category.name.toLowerCase()}. 
          Curated for the modern professional seeking comfort, style, and durability.
        </p>
      </div>

      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-muted-foreground font-medium">Showing {products.length} products</p>
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
              <ProductFilters categories={categories} brands={brands} />
            </SheetContent>
          </Sheet>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="outline" className="flex items-center gap-2 w-full md:w-auto justify-between">
                Sort by: Featured <ChevronDown className="w-4 h-4" />
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

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {/* Sidebar Desktop */}
        <aside className="hidden md:block md:col-span-1 border-r pr-6 min-h-[500px]">
          <Suspense fallback={<div className="space-y-4"><div className="h-4 bg-muted animate-pulse rounded w-1/2"></div><div className="h-32 bg-muted animate-pulse rounded"></div></div>}>
            <ProductFilters categories={categories} brands={brands} />
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
                We couldn't find any products in this category at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
