import { Metadata } from "next";
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
import { Download, Filter, Plus, Search, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { ExportProductsButton } from "./ExportProductsButton";
import { getAdminProductsAction } from "@/lib/actions/admin/products.actions";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Products | Manager Dashboard",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const search = (await searchParams).search || "";
  const page = parseInt((await searchParams).page || "1", 10);

  const res = await getAdminProductsAction({ search, page, limit: 20 });
  const products = res.data?.products || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your product catalog and inventory.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportProductsButton products={products} />
          <Button>
            <Link href="/manager/products/new" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            className="w-full bg-background pl-8"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
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
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-xs text-muted-foreground overflow-hidden">
                        {(product as any).media?.[0]?.url ? (
                          <img 
                            src={(product as any).media[0].url} 
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          "Img"
                        )}
                      </div>
                      <div>
                        <p>{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          SKU: {product.sku || "N/A"}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {(product as any).category?.name || "Uncategorized"}
                  </TableCell>
                  <TableCell>{formatCurrency((product as any).base_price || 0)}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">Tracked</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "ACTIVE"
                          ? "default"
                          : product.status === "ARCHIVED"
                            ? "secondary"
                            : "outline"
                      }
                      className={
                        product.status === "ACTIVE"
                          ? "bg-emerald-500 hover:bg-emerald-600"
                          : ""
                      }
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/manager/products/${product.id}/edit`}>
                          <Edit className="h-4 w-4 text-muted-foreground" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
