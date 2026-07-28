import { Metadata } from 'next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Play, CheckSquare, Printer, Settings2, Users } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Order Picking & Fulfillment | Anchor Fashion Enterprise',
  description: 'Manage Wave Picks, Batch Picks, and Order Fulfillment',
};

// Mock data for development
const mockPickLists = [
  { id: 'PL-001', type: 'WAVE', warehouse: 'Central Hub - Dhaka', itemsTotal: 245, itemsPicked: 245, status: 'COMPLETED', assignedTo: 'Team A', priority: 'High' },
  { id: 'PL-002', type: 'BATCH', warehouse: 'Central Hub - Dhaka', itemsTotal: 150, itemsPicked: 120, status: 'IN_PROGRESS', assignedTo: 'Team B', priority: 'Medium' },
  { id: 'PL-003', type: 'SINGLE', warehouse: 'Regional Hub - Chattogram', itemsTotal: 5, itemsPicked: 0, status: 'PENDING', assignedTo: 'Unassigned', priority: 'Rush' },
  { id: 'PL-004', type: 'WAVE', warehouse: 'Fulfillment Center - Sylhet', itemsTotal: 400, itemsPicked: 10, status: 'IN_PROGRESS', assignedTo: 'Team C', priority: 'Medium' },
  { id: 'PL-005', type: 'BATCH', warehouse: 'Central Hub - Dhaka', itemsTotal: 85, itemsPicked: 0, status: 'PENDING', assignedTo: 'Unassigned', priority: 'Low' },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'PENDING': return <Badge variant="outline">Pending</Badge>;
    case 'IN_PROGRESS': return <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">In Progress</Badge>;
    case 'COMPLETED': return <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">Completed</Badge>;
    default: return <Badge variant="outline">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case 'Rush': return <Badge variant="destructive">Rush</Badge>;
    case 'High': return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">High</Badge>;
    case 'Medium': return <Badge variant="secondary">Medium</Badge>;
    case 'Low': return <Badge variant="outline">Low</Badge>;
    default: return <Badge variant="outline">{priority}</Badge>;
  }
};

export default function PickListsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Order Fulfillment</h1>
          <p className="text-muted-foreground">Manage pick lists, wave generation, and packing station handoffs.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline"><Settings2 className="mr-2 h-4 w-4" /> Pick Strategies</Button>
          <Button><Play className="mr-2 h-4 w-4" /> Generate Wave</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders to Pick</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,204</div>
            <p className="text-xs text-muted-foreground mt-1">Orders waiting for allocation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Pickers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground mt-1">Staff currently picking</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fulfillment Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">850 / hr</div>
            <p className="text-xs text-muted-foreground mt-1">Average items picked per hour</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Pick Lists</CardTitle>
          <CardDescription>Generated lists assigned to warehouse staff.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>List ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPickLists.map((list) => {
                const progress = (list.itemsPicked / list.itemsTotal) * 100;
                return (
                  <TableRow key={list.id}>
                    <TableCell className="font-medium">{list.id}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{list.type}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{list.warehouse}</TableCell>
                    <TableCell>{getPriorityBadge(list.priority)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="mr-2 h-3 w-3 text-muted-foreground" />
                        {list.assignedTo}
                      </div>
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between text-xs">
                          <span>{list.itemsPicked} / {list.itemsTotal} items</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(list.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" title="Print Pick List">
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="View Details">
                          <CheckSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
