import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Tag,
  Layers,
  AlertTriangle,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function CatalogDashboardPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Catalog Dashboard
          </h1>
          <p className="mt-1 text-muted-foreground">
            Manage your products, categories, and brands.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/catalog/products/new">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Products</CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,248</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Active items in catalog
            </p>
            <Link
              href="/admin/catalog/products"
              className="mt-4 flex items-center text-sm text-blue-600 hover:underline"
            >
              Manage Products <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Categories</CardTitle>
            <Layers className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Structured collections
            </p>
            <Link
              href="/admin/catalog/categories"
              className="mt-4 flex items-center text-sm text-blue-600 hover:underline"
            >
              Manage Categories <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        {/* Brands */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Brands</CardTitle>
            <Tag className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">42</div>
            <p className="mt-1 text-sm text-muted-foreground">
              Partner & internal brands
            </p>
            <Link
              href="/admin/catalog/brands"
              className="mt-4 flex items-center text-sm text-blue-600 hover:underline"
            >
              Manage Brands <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Needs Attention
            </CardTitle>
            <CardDescription>
              Products missing vital information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border bg-amber-50/50 p-3">
                <div>
                  <p className="text-sm font-medium">Missing Images</p>
                  <p className="text-xs text-muted-foreground">
                    12 products have no main image
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Fix Now
                </Button>
              </div>
              <div className="flex items-center justify-between rounded-lg border bg-amber-50/50 p-3">
                <div>
                  <p className="text-sm font-medium">Missing Descriptions</p>
                  <p className="text-xs text-muted-foreground">
                    5 products have empty descriptions
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Fix Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest changes to your catalog.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    New product added: Premium Leather Jacket
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by Admin • 2 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Category updated: Summer Collection
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by Admin • 5 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    Price changed: Classic Blue Jeans
                  </p>
                  <p className="text-xs text-muted-foreground">
                    by Admin • 1 day ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
