import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { MapPin, Users, Settings, Search, Plus, Map } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Warehouse Management | Anchor Fashion Enterprise',
  description: 'Enterprise Warehouse and Location Management',
};

// Mock data for development
const mockWarehouses = [
  { 
    id: '1', 
    code: 'WH-DH-01', 
    name: 'Central Hub - Dhaka', 
    type: 'Distribution Center',
    manager: 'Rafiqul Islam',
    staffCount: 145,
    capacityUtilized: 78,
    status: 'Active',
    address: 'Tejgaon Industrial Area, Dhaka',
    activeOrders: 1240
  },
  { 
    id: '2', 
    code: 'WH-CTG-01', 
    name: 'Regional Hub - Chattogram', 
    type: 'Regional Warehouse',
    manager: 'Selim Reza',
    staffCount: 42,
    capacityUtilized: 65,
    status: 'Active',
    address: 'Halishahar, Chattogram',
    activeOrders: 320
  },
  { 
    id: '3', 
    code: 'WH-SYL-01', 
    name: 'Fulfillment Center - Sylhet', 
    type: 'Fulfillment Center',
    manager: 'Anika Rahman',
    staffCount: 28,
    capacityUtilized: 92,
    status: 'Near Capacity',
    address: 'Amberkhana, Sylhet',
    activeOrders: 185
  }
];

export default function WarehouseDashboard() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Warehouse Management</h1>
          <p className="text-muted-foreground">Manage distribution centers, capacity, and staff allocation.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Map className="mr-2 h-4 w-4" /> View Map</Button>
          <Button><Plus className="mr-2 h-4 w-4" /> Add Warehouse</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockWarehouses.map((warehouse) => (
          <Card key={warehouse.id} className="flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline">{warehouse.code}</Badge>
                <Badge variant={warehouse.status === 'Active' ? 'default' : 'destructive'}>
                  {warehouse.status}
                </Badge>
              </div>
              <CardTitle className="text-xl">{warehouse.name}</CardTitle>
              <CardDescription className="flex items-center mt-1">
                <MapPin className="h-3 w-3 mr-1" /> {warehouse.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              
              <div className="flex justify-between items-center text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">Type</span>
                  <span className="font-medium">{warehouse.type}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-muted-foreground">Active Orders</span>
                  <span className="font-medium text-blue-600">{warehouse.activeOrders}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Capacity Utilization</span>
                  <span className="font-medium">{warehouse.capacityUtilized}%</span>
                </div>
                <Progress 
                  value={warehouse.capacityUtilized} 
                  className={`h-2 ${warehouse.capacityUtilized > 90 ? 'bg-red-100' : ''}`}
                />
              </div>

              <div className="flex items-center text-sm border-t pt-4 mt-auto">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-muted-foreground mr-1">Manager:</span>
                <span className="font-medium">{warehouse.manager}</span>
                <span className="ml-auto text-muted-foreground">{warehouse.staffCount} Staff</span>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Link href={`/admin/operations/warehouses/${warehouse.id}`} className="w-full">
                  <Button variant="secondary" className="w-full">Manage Zones & Bins</Button>
                </Link>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
