import { Suspense } from "react";
import { CatalogRepository } from "@/repositories/catalog.repository";
import { ProductCard } from "@/components/product/product-card";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Search Results | Anchor Fashion",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const query = typeof searchParams.q === 'string' ? searchParams.q : '';
  
  // Only fetch if there is a query
  let products = [];
  if (query) {
    const res = await CatalogRepository.getProducts({ search: query, limit: 20 });
    products = res.data || [];
  }

  return (
    <div className="container py-8 md:py-12 min-h-[70vh]">
      <div className="max-w-3xl mx-auto mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Search Results</h1>
        {query ? (
          <p className="text-muted-foreground">
            Showing {products.length} results for <span className="font-semibold text-foreground">"{query}"</span>
          </p>
        ) : (
          <p className="text-muted-foreground">Enter a search term to find products.</p>
        )}
      </div>

      {!query ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-lg border border-dashed">
          <Search className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
          <h2 className="text-xl font-medium mb-2">What are you looking for?</h2>
          <p className="text-muted-foreground mb-6 max-w-sm text-center">
            Use the search bar above to find specific products, brands, or categories.
          </p>
          <Button>
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-lg border border-dashed">
          <Search className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
          <h2 className="text-xl font-medium mb-2">No results found</h2>
          <p className="text-muted-foreground mb-6 max-w-sm text-center">
            We couldn't find anything matching "{query}". Try checking your spelling or using different keywords.
          </p>
          <Button variant="outline">
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
