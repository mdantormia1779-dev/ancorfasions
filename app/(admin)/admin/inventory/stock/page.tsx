import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';

export const metadata: Metadata = {
  title: 'Stock Control | Anchor Fashion',
};

export default async function StockControlPage() {
  const supabase = await createClient();
  const { data: inventory } = await supabase
    .from('inventory_levels')
    .select('*, variants(sku, name), warehouses(name)')
    .order('quantity_available', { ascending: true });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Stock Control</h2>
          <p className="text-muted-foreground">Monitor and adjust real-time inventory levels.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Adjust Stock
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Current Inventory</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search SKU or name..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead className="text-right">Available</TableHead>
                <TableHead className="text-right">Reserved</TableHead>
                <TableHead className="text-right">Incoming</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {item.variants?.sku || 'N/A'}
                    {item.quantity_available === 0 && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">Out of Stock</span>
                    )}
                    {item.quantity_available > 0 && item.quantity_available <= (item.reorder_point || 0) && (
                      <span className="ml-2 inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-semibold text-yellow-800">Low Stock</span>
                    )}
                  </TableCell>
                  <TableCell>{item.variants?.name || 'N/A'}</TableCell>
                  <TableCell>{item.warehouses?.name || 'N/A'}</TableCell>
                  <TableCell className="text-right font-semibold">{item.quantity_available}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.quantity_reserved}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{item.quantity_incoming}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Adjust</Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!inventory || inventory.length === 0) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                    No inventory records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
