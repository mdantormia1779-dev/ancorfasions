import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Tag, Layers, AlertTriangle, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CatalogDashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Catalog Dashboard</h1>
          <p className="text-muted-foreground mt-1">
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium">Products</CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">1,248</div>
            <p className="text-sm text-muted-foreground mt-1">
              Active items in catalog
            </p>
            <Link href="/admin/catalog/products" className="mt-4 flex items-center text-sm text-blue-600 hover:underline">
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
            <p className="text-sm text-muted-foreground mt-1">
              Structured collections
            </p>
            <Link href="/admin/catalog/categories" className="mt-4 flex items-center text-sm text-blue-600 hover:underline">
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
            <p className="text-sm text-muted-foreground mt-1">
              Partner & internal brands
            </p>
            <Link href="/admin/catalog/brands" className="mt-4 flex items-center text-sm text-blue-600 hover:underline">
              Manage Brands <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Needs Attention
            </CardTitle>
            <CardDescription>Products missing vital information.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-amber-50/50">
                <div>
                  <p className="font-medium text-sm">Missing Images</p>
                  <p className="text-xs text-muted-foreground">12 products have no main image</p>
                </div>
                <Button variant="outline" size="sm">Fix Now</Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg bg-amber-50/50">
                <div>
                  <p className="font-medium text-sm">Missing Descriptions</p>
                  <p className="text-xs text-muted-foreground">5 products have empty descriptions</p>
                </div>
                <Button variant="outline" size="sm">Fix Now</Button>
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
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">New product added: Premium Leather Jacket</p>
                  <p className="text-xs text-muted-foreground">by Admin • 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Category updated: Summer Collection</p>
                  <p className="text-xs text-muted-foreground">by Admin • 5 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Price changed: Classic Blue Jeans</p>
                  <p className="text-xs text-muted-foreground">by Admin • 1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
