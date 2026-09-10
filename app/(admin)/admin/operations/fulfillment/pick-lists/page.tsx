import { Metadata } from "next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Play, CheckSquare, Printer, Settings2, Users, PackageCheck } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Order Picking & Fulfillment | Anchor Fashion Enterprise",
  description: "Manage Wave Picks, Batch Picks, and Order Fulfillment",
};

interface PickList {
  id: string;
  type: string;
  warehouse: string;
  itemsTotal: number;
  itemsPicked: number;
  status: string;
  assignedTo: string;
  priority: string;
}

const getStatusBadge = (status: string) => {
  switch (status) {
    case "PENDING":
      return <Badge variant="outline">Pending</Badge>;
    case "IN_PROGRESS":
      return (
        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">
          In Progress
        </Badge>
      );
    case "COMPLETED":
      return (
        <Badge
          variant="default"
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          Completed
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "Rush":
      return <Badge variant="destructive">Rush</Badge>;
    case "High":
      return (
        <Badge
          variant="secondary"
          className="bg-amber-100 text-amber-800 hover:bg-amber-100"
        >
          High
        </Badge>
      );
    case "Medium":
      return <Badge variant="secondary">Medium</Badge>;
    case "Low":
      return <Badge variant="outline">Low</Badge>;
    default:
      return <Badge variant="outline">{priority}</Badge>;
  }
};

export default async function PickListsPage() {
  const supabase = await createClient();
  const { count: pendingCount } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .in("status", ["pending", "processing", "PAID"]);

  const pickLists: PickList[] = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Order Fulfillment
          </h1>
          <p className="text-muted-foreground">
            Manage pick lists, wave generation, and packing station handoffs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings2 className="mr-2 h-4 w-4" /> Pick Strategies
          </Button>
          <Button>
            <Play className="mr-2 h-4 w-4" /> Generate Wave
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Orders to Pick
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingCount ?? 0}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Orders waiting for allocation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Pick Lists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pickLists.length}</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Active warehouse batches
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Warehouse Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Ready</div>
            <p className="mt-1 text-xs text-muted-foreground">
              Central Hub dispatch operational
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Pick Lists</CardTitle>
          <CardDescription>
            Generated lists assigned to warehouse staff.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pickLists.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <PackageCheck className="h-12 w-12 text-muted-foreground/40 mb-3" />
              <h3 className="text-lg font-medium text-foreground">No active pick lists</h3>
              <p className="text-sm mt-1 max-w-sm">
                There are currently no active picking batches. Click &quot;Generate Wave&quot; to group unfulfilled orders into warehouse pick lists.
              </p>
            </div>
          ) : (
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
                {pickLists.map((list) => {
                  const progress = (list.itemsPicked / list.itemsTotal) * 100;
                  return (
                    <TableRow key={list.id}>
                      <TableCell className="font-medium">{list.id}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{list.type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {list.warehouse}
                      </TableCell>
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
                            <span>
                              {list.itemsPicked} / {list.itemsTotal} items
                            </span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(list.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Print Pick List"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Details"
                          >
                            <CheckSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
