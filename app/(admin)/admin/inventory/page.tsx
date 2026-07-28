import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PackageSearch, Warehouse, FileText, ArrowLeftRight, Truck, ClipboardCheck, ArrowUpRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Inventory & WMS Dashboard | Anchor Fashion',
  description: 'Enterprise Inventory and Warehouse Management System',
};

export default function InventoryDashboardPage() {
  const modules = [
    { name: 'Warehouses', desc: 'Manage locations & bins', href: '/admin/inventory/warehouses', icon: Warehouse, color: 'text-blue-500' },
    { name: 'Stock Control', desc: 'Real-time inventory levels', href: '/admin/inventory/stock', icon: PackageSearch, color: 'text-indigo-500' },
    { name: 'Purchases (PO)', desc: 'Purchase orders & receiving', href: '/admin/inventory/purchases', icon: FileText, color: 'text-green-500' },
    { name: 'Suppliers', desc: 'Manage vendor profiles', href: '/admin/inventory/suppliers', icon: Truck, color: 'text-orange-500' },
    { name: 'Stock Transfers', desc: 'Internal location movements', href: '/admin/inventory/transfers', icon: ArrowLeftRight, color: 'text-purple-500' },
    { name: 'Fulfillment', desc: 'Pick, pack & ship operations', href: '/admin/inventory/fulfillment', icon: ArrowUpRight, color: 'text-teal-500' },
    { name: 'Inventory Audits', desc: 'Cycle counting & reconciliation', href: '/admin/inventory/audits', icon: ClipboardCheck, color: 'text-rose-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Inventory & WMS</h2>
          <p className="text-muted-foreground">Manage your enterprise supply chain operations.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {modules.map((mod) => (
          <Card key={mod.name} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">{mod.name}</CardTitle>
              <mod.icon className={`h-5 w-5 ${mod.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{mod.desc}</p>
              <Button variant="outline" size="sm" className="w-full">
                <Link href={mod.href}>Manage</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Low Stock Alerts</CardTitle>
            <CardDescription>Items below reorder point</CardDescription>
          </CardHeader>
          <CardContent>
             {/* This would be populated dynamically */}
             <div className="text-sm text-muted-foreground text-center py-8">
               No low stock alerts at this time.
             </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Purchase Orders</CardTitle>
            <CardDescription>Awaiting goods receipt</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="text-sm text-muted-foreground text-center py-8">
               No pending POs found.
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
