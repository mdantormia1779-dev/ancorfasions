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

export const metadata: Metadata = {
  title: "Products | Manager Dashboard",
};

const products = [
  {
    id: "PRD-1001",
    name: "Classic Oxford Shirt",
    category: "Shirts",
    price: "$125.00",
    stock: 145,
    status: "Active",
  },
  {
    id: "PRD-1002",
    name: "Slim Fit Chinos",
    category: "Pants",
    price: "$95.00",
    stock: 85,
    status: "Active",
  },
  {
    id: "PRD-1003",
    name: "Leather Loafers",
    category: "Shoes",
    price: "$195.00",
    stock: 12,
    status: "Low Stock",
  },
  {
    id: "PRD-1004",
    name: "Merino Wool Sweater",
    category: "Knitwear",
    price: "$150.00",
    stock: 0,
    status: "Out of Stock",
  },
  {
    id: "PRD-1005",
    name: "Silk Tie",
    category: "Accessories",
    price: "$65.00",
    stock: 230,
    status: "Active",
  },
];

export default function ProductsPage() {
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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Link href="/manager/products/new">
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

      <div className="rounded-md border">
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
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-muted text-xs text-muted-foreground">
                      Img
                    </div>
                    <div>
                      <p>{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.id}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.status === "Active"
                        ? "default"
                        : product.status === "Low Stock"
                          ? "secondary"
                          : "destructive"
                    }
                    className={
                      product.status === "Low Stock"
                        ? "bg-orange-500 text-white hover:bg-orange-600"
                        : ""
                    }
                  >
                    {product.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
