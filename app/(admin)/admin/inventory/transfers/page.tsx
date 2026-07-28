import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

export const metadata: Metadata = {
  title: 'Stock Transfers | Anchor Fashion',
};

export default async function TransfersPage() {
  const supabase = await createClient();
  const { data: transfers } = await supabase
    .from('stock_ledger')
    .select('*, variants(sku, name)')
    .eq('movement_type', 'INTERNAL_TRANSFER')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Stock Transfers</h2>
          <p className="text-muted-foreground">Manage internal inventory movements.</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New Transfer
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers?.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell>{format(new Date(transfer.created_at), 'PP')}</TableCell>
                  <TableCell className="font-medium">{transfer.variants?.sku || 'N/A'}</TableCell>
                  <TableCell>{transfer.variants?.name || 'N/A'}</TableCell>
                  <TableCell>{Math.abs(transfer.quantity)}</TableCell>
                  <TableCell>{transfer.reference_type} - {transfer.reference_id}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Details</Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!transfers || transfers.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No stock transfers found.
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
