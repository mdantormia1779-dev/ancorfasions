import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';

import { getInventoryMovements } from '@/actions/inventory.actions';

export const metadata: Metadata = {
  title: 'Stock Transfers | Anchor Fashion',
};

export default async function TransfersPage() {
  const { data: transfers } = await getInventoryMovements(1, 100);
  const internalTransfers = transfers?.filter(t => t.movement_type === 'TRANSFER');

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
              {internalTransfers?.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell>{format(new Date(transfer.created_at), 'PP')}</TableCell>
                  <TableCell className="font-medium">{transfer.variant_id || 'N/A'}</TableCell>
                  <TableCell>{transfer.movement_type}</TableCell>
                  <TableCell>{Math.abs(transfer.quantity)}</TableCell>
                  <TableCell>{transfer.reason_code || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">Details</Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!internalTransfers || internalTransfers.length === 0) && (
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
