import { Suspense } from "react";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProductRepository } from "@/lib/repositories/catalog/product.repository";

export const metadata = {
  title: "Products | Catalog | Anchor Fashion Enterprise",
};

// Next.js 16 SearchParams are props
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string; status?: string };
}) {
  const q = searchParams.q || "";
  const page = parseInt(searchParams.page || "1");
  const status = searchParams.status || "";

  const { products, total } = await ProductRepository.getProducts({
    search: q,
    page,
    limit: 20,
    status,
  });

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

      <div className="flex items-center gap-4 py-4">
        <div className="relative w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products by name, SKU..."
            className="pl-8"
            defaultValue={q}
            // In a real app, use a client component or form for instant search
          />
        </div>
        <Button variant="outline" className="ml-auto">
          <Filter className="mr-2 h-4 w-4" /> Filters
        </Button>
      </div>

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
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {/* Placeholder for product thumbnail */}
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
                  <TableCell>{(product as any).category?.name}</TableCell>
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

      {/* Pagination component would go here */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {products.length} of {total} products
        </div>
        <Button variant="outline" size="sm" disabled={page <= 1}>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={products.length < 20}>
          Next
        </Button>
      </div>
    </div>
  );
}
