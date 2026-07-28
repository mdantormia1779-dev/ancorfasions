import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Package, AlertTriangle, ArrowRightLeft, TrendingUp, Search, Plus, Filter } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Inventory Management | Anchor Fashion Enterprise',
  description: 'Enterprise Inventory and Stock Management Dashboard',
};

// Mock data for development
const mockInventory = [
  { id: '1', sku: 'AF-M-SH-BL-M', name: 'Classic Oxford Shirt - Blue - M', available: 124, reserved: 12, incoming: 50, damaged: 1, reorderPoint: 30, status: 'Healthy' },
  { id: '2', sku: 'AF-W-DR-RD-S', name: 'Summer Midi Dress - Red - S', available: 5, reserved: 8, incoming: 0, damaged: 0, reorderPoint: 15, status: 'Low Stock' },
  { id: '3', sku: 'AF-M-PT-CH-32', name: 'Chino Pants - Khaki - 32', available: 0, reserved: 2, incoming: 100, damaged: 0, reorderPoint: 20, status: 'Out of Stock' },
  { id: '4', sku: 'AF-A-BL-BK-L', name: 'Leather Belt - Black - L', available: 45, reserved: 3, incoming: 0, damaged: 2, reorderPoint: 10, status: 'Healthy' },
  { id: '5', sku: 'AF-W-TP-WH-M', name: 'Silk Blouse - White - M', available: 8, reserved: 2, incoming: 30, damaged: 0, reorderPoint: 15, status: 'Low Stock' },
];

export default function InventoryDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Monitor real-time stock levels, valuations, and movements.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer Stock</Button>
          <Button><Plus className="mr-2 h-4 w-4" /> Receive Goods</Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142,304</div>
            <p className="text-xs text-muted-foreground">Across all warehouses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">34</div>
            <p className="text-xs text-muted-foreground">SKUs below reorder point</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incoming (PO)</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,200</div>
            <p className="text-xs text-muted-foreground">Units in transit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            <span className="h-4 w-4 text-muted-foreground font-semibold">৳</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4M</div>
            <p className="text-xs text-muted-foreground">Current valuation (MAC)</p>
          </CardContent>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <CardTitle>Stock Ledger</CardTitle>
              <CardDescription>Real-time view of all variants across the enterprise network.</CardDescription>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search SKU or name..." className="pl-8" />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU / Product</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Reserved</TableHead>
                <TableHead className="text-right">Incoming</TableHead>
                <TableHead className="text-right">Damaged</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-medium">{item.sku}</div>
                    <div className="text-xs text-muted-foreground">{item.name}</div>
                  </TableCell>
                  <TableCell className="text-right font-semibold">{item.available}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.reserved}</TableCell>
                  <TableCell className="text-right text-blue-600">{item.incoming}</TableCell>
                  <TableCell className="text-right text-red-500">{item.damaged}</TableCell>
                  <TableCell>
                    <Badge variant={
                      item.status === 'Healthy' ? 'default' :
                      item.status === 'Low Stock' ? 'secondary' : 'destructive'
                    }>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">Details</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
