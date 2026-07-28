import { Metadata } from 'next';
import { AnalyticsService } from '@/services/analytics.service';
import { StatCard } from '@/features/analytics/components/StatCard';
import { SimplePieChart } from '@/features/analytics/components/Charts';
import { Package, PackageMinus, PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RefreshCwIcon } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Inventory Analytics | Anchor Fashion',
};

export const dynamic = 'force-dynamic';

export default async function InventoryAnalyticsPage() {
  const inventoryAnalytics = await AnalyticsService.getInventoryAnalytics();
  
  const inStock = inventoryAnalytics.stockLevels.find(s => s.name === 'In Stock')?.value || 0;
  const lowStock = inventoryAnalytics.stockLevels.find(s => s.name === 'Low Stock')?.value || 0;
  const outOfStock = inventoryAnalytics.stockLevels.find(s => s.name === 'Out of Stock')?.value || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Analytics</h1>
          <p className="text-muted-foreground">
            Monitor stock levels, turnover, and forecasting.
          </p>
        </div>
        <Button variant="outline" size="icon">
          <RefreshCwIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard 
          title="Healthy Stock Items" 
          value={inStock.toLocaleString()}
          icon={<Package className="w-4 h-4" />}
          description="Items well above reorder point"
        />
        <StatCard 
          title="Low Stock Items" 
          value={lowStock.toLocaleString()}
          icon={<PackageMinus className="w-4 h-4" />}
          description="Items needing immediate reorder"
        />
        <StatCard 
          title="Out of Stock Items" 
          value={outOfStock.toLocaleString()}
          icon={<PackageX className="w-4 h-4" />}
          description="Items completely depleted"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SimplePieChart 
          title="Stock Level Distribution" 
          description="Overview of current inventory health"
          data={inventoryAnalytics.stockLevels}
        />
      </div>
    </div>
  );
}
