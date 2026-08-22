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
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = typeof (await searchParams).q === "string" ? (await searchParams).q : "";

  // Only fetch if there is a query
  let products = [];
  if (query) {
    const res = await CatalogRepository.getProducts({
      search: query,
      limit: 20,
    });
    products = res.data || [];
  }

  return (
    <div className="container min-h-[70vh] py-8 md:py-12">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <h1 className="mb-2 text-3xl font-bold tracking-tight">
          Search Results
        </h1>
        {query ? (
          <p className="text-muted-foreground">
            Showing {products.length} results for{" "}
            <span className="font-semibold text-foreground">"{query}"</span>
          </p>
        ) : (
          <p className="text-muted-foreground">
            Enter a search term to find products.
          </p>
        )}
      </div>

      {!query ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 py-20">
          <Search className="mb-4 h-12 w-12 text-muted-foreground opacity-20" />
          <h2 className="mb-2 text-xl font-medium">
            What are you looking for?
          </h2>
          <p className="mb-6 max-w-sm text-center text-muted-foreground">
            Use the search bar above to find specific products, brands, or
            categories.
          </p>
          <Button>
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/20 py-20">
          <Search className="mb-4 h-12 w-12 text-muted-foreground opacity-20" />
          <h2 className="mb-2 text-xl font-medium">No results found</h2>
          <p className="mb-6 max-w-sm text-center text-muted-foreground">
            We couldn't find anything matching "{query}". Try checking your
            spelling or using different keywords.
          </p>
          <Button variant="outline">
            <Link href="/products">Browse All Products</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
