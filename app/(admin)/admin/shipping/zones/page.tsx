'use client';

import { useState } from 'react';
import { useDeliveryZones } from '@/hooks/shipping/use-delivery-zones';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { MapPin, Plus, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function AdminDeliveryZonesPage() {
  const { data: zones, isLoading } = useDeliveryZones();
  const [search, setSearch] = useState('');

  const filtered = zones?.filter((z: any) =>
    !search || z.name.toLowerCase().includes(search.toLowerCase()) || z.code.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Zones</h1>
          <p className="text-muted-foreground mt-1">Configure delivery areas, estimated days, and shipping rates</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/shipping"><Button variant="outline" size="sm">← Shipping</Button></Link>
          <Button size="sm" className="flex items-center gap-1"><Plus className="h-4 w-4" /> New Zone</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Zones</CardTitle>
          <Input
            placeholder="Search zones…"
            className="max-w-xs mt-2"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-muted-foreground">Loading zones…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zone Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Districts</TableHead>
                  <TableHead>Est. Days</TableHead>
                  <TableHead>COD</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No zones found.</TableCell>
                  </TableRow>
                )}
                {filtered.map((zone: any) => (
                  <TableRow key={zone.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{zone.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5">{zone.code}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-sm">
                        {(zone.districts ?? []).slice(0, 5).map((d: string) => (
                          <span key={d} className="text-xs bg-blue-50 text-blue-700 rounded px-1.5 py-0.5">{d}</span>
                        ))}
                        {(zone.districts ?? []).length > 5 && (
                          <span className="text-xs text-muted-foreground">+{zone.districts.length - 5} more</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {zone.estimated_days_min}–{zone.estimated_days_max} days
                    </TableCell>
                    <TableCell>
                      {zone.is_cod_available ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-400" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={zone.is_active ? 'default' : 'secondary'}>
                        {zone.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/shipping/zones/${zone.id}`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
