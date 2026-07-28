import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, Search, ArrowRightLeft, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Inventory Management | Manager Dashboard",
};

const inventory = [
  { id: "PRD-1001", sku: "SHR-OX-01", name: "Classic Oxford Shirt", warehouse: "NY-Main", available: 145, reserved: 12, status: "In Stock" },
  { id: "PRD-1002", sku: "PNT-CH-03", name: "Slim Fit Chinos", warehouse: "NY-Main", available: 85, reserved: 5, status: "In Stock" },
  { id: "PRD-1003", sku: "SHO-LF-02", name: "Leather Loafers", warehouse: "LA-West", available: 12, reserved: 2, status: "Low Stock" },
  { id: "PRD-1004", sku: "SWT-MW-05", name: "Merino Wool Sweater", warehouse: "NY-Main", available: 0, reserved: 0, status: "Out of Stock" },
  { id: "PRD-1005", sku: "TIE-SLK-01", name: "Silk Tie", warehouse: "UK-London", available: 230, reserved: 45, status: "In Stock" },
];

export default function InventoryPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Track stock levels across all warehouses.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button>
            <ArrowRightLeft className="mr-2 h-4 w-4" />
            Stock Transfer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items in Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,450</div>
            <p className="text-xs text-muted-foreground">Across 3 warehouses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">24</div>
            <p className="text-xs text-muted-foreground">Require attention soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-destructive">Out of Stock</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">8</div>
            <p className="text-xs text-muted-foreground">Currently unavailable</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search SKU or Product Name..."
            className="w-full bg-background pl-8"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>SKU</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Warehouse</TableHead>
              <TableHead className="text-right">Available</TableHead>
              <TableHead className="text-right">Reserved</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item) => (
              <TableRow key={item.sku}>
                <TableCell className="font-medium text-muted-foreground">{item.sku}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.warehouse}</TableCell>
                <TableCell className="text-right font-medium">{item.available}</TableCell>
                <TableCell className="text-right text-muted-foreground">{item.reserved}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      item.status === "In Stock" ? "default" :
                      item.status === "Low Stock" ? "secondary" : "destructive"
                    }
                    className={item.status === "Low Stock" ? 'bg-orange-500 hover:bg-orange-600 text-white' : ''}
                  >
                    {item.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    Adjust
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
