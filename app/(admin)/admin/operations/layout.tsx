import { ReactNode } from 'react';
import Link from 'next/link';
import { Package, Warehouse, Truck, ShoppingCart, RotateCcw, Box, BarChart3, ScanBarcode } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OperationsLayout({ children }: { children: ReactNode }) {
  const navItems = [
    {
      title: 'Inventory',
      icon: Package,
      href: '/admin/operations/inventory',
    },
    {
      title: 'Warehouses',
      icon: Warehouse,
      href: '/admin/operations/warehouses',
    },
    {
      title: 'Procurement',
      icon: ShoppingCart,
      href: '/admin/operations/procurement/purchase-orders',
    },
    {
      title: 'Fulfillment',
      icon: Box,
      href: '/admin/operations/fulfillment/pick-lists',
    },
    {
      title: 'Couriers',
      icon: Truck,
      href: '/admin/operations/logistics/couriers',
    },
    {
      title: 'Returns',
      icon: RotateCcw,
      href: '/admin/operations/returns/requests',
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      href: '/admin/operations/analytics',
    },
    {
      title: 'Scan Station',
      icon: ScanBarcode,
      href: '/admin/operations/scan',
    },
  ];

  return (
    <div className="flex h-full flex-col lg:flex-row gap-6">
      <aside className="w-full lg:w-64 shrink-0">
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button variant="ghost" className="w-full justify-start">
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Button>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
