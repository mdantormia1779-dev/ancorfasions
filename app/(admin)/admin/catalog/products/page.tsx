import Link from "next/link";
import { Plus, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/ui/search-input";
import { ProductRepository } from "@/lib/repositories/catalog/product.repository";

export const metadata = {
  title: "Products | Catalog | Anchor Fashion Enterprise",
};

// Next.js 15: searchParams is a Promise — must be awaited
export default async function AdminCatalogProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  const { q = "", page: pageStr = "1", status = "" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);

  const { products, total } = await ProductRepository.getProducts({
    search: q || undefined,
    page,
    limit: 20,
    // Pass undefined (not empty string) to avoid spurious cache key mismatch
    status: status || undefined,
  });

  const totalPages = Math.ceil(total / 20);

  // Build URL helper — preserves existing params and updates the one changed
  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    params.set("page", String(page));
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined || v === "") params.delete(k);
      else params.set(k, v);
    }
    return `/admin/catalog/products?${params.toString()}`;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
        <div className="flex items-center space-x-2">
          <Link href="/admin/catalog/products/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Search & Filter — using a plain HTML form for progressive enhancement */}
      <form
        method="GET"
        action="/admin/catalog/products"
        className="flex items-center gap-4 py-4"
      >
        <div className="relative w-72">
          <SearchInput
            name="q"
            placeholder="Search products by name, SKU..."
            defaultValue={q}
          />
        </div>
        {/* Preserve status in form submission */}
        {status && <input type="hidden" name="status" value={status} />}
        <input type="hidden" name="page" value="1" />

        {/* Status filter */}
        <select
          name="status"
          defaultValue={status}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="DRAFT">Draft</option>
          <option value="ARCHIVED">Archived</option>
        </select>

        <Button type="submit" variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Apply
        </Button>

        {(q || status) && (
          <Link href="/admin/catalog/products">
            <Button type="button" variant="ghost" size="sm">
              Clear
            </Button>
          </Link>
        )}
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Info</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {q || status
                    ? "No products match your filters."
                    : "No products found."}
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                        <span className="text-xs text-muted-foreground">
                          IMG
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(product as any).brand?.name || "No Brand"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{(product as any).sku || "N/A"}</TableCell>
                  <TableCell>
                    {(product as any).category?.name ?? (
                      <span className="text-muted-foreground italic">
                        Uncategorized
                      </span>
                    )}
                  </TableCell>
                  <TableCell>${product.basePrice.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "ACTIVE"
                          ? "default"
                          : product.status === "ARCHIVED"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/admin/catalog/products/${product.id}`}>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination — proper href-based navigation */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {(page - 1) * 20 + 1}–{Math.min(page * 20, total)} of{" "}
          {total} products
        </div>
        <Link
          href={buildUrl({ page: String(page - 1) })}
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : undefined}
        >
          <Button variant="outline" size="sm" disabled={page <= 1}>
            Previous
          </Button>
        </Link>
        <span className="text-sm text-muted-foreground">
          Page {page} of {totalPages || 1}
        </span>
        <Link
          href={buildUrl({ page: String(page + 1) })}
          aria-disabled={page >= totalPages}
          tabIndex={page >= totalPages ? -1 : undefined}
        >
          <Button variant="outline" size="sm" disabled={page >= totalPages}>
            Next
          </Button>
        </Link>
      </div>
    </div>
  );
}
