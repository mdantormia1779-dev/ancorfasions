"use client";

import { useState } from "react";
import { useOrders } from "@/hooks/oms/use-orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrderStatus } from "@/types/oms";

export default function AdminProcessingOrdersPage() {
  const [page, setPage] = useState(1);
  const status: OrderStatus = "preparing"; // or paid
  const { data, isLoading, error } = useOrders({ page, limit: 10, status });

  if (error) return <div>Error loading orders</div>;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Processing Orders</h1>
        <Button>Export Orders</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders Being Prepared</CardTitle>
          <div className="flex space-x-2">
            <Input placeholder="Search order number..." className="max-w-xs" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-4 text-center">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order #</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.data?.map((order: any) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        {order.order_number}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{order.customer_id || "Guest"}</TableCell>
                    <TableCell>${order.grand_total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
                {(!data?.data || data.data.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-4 text-center text-muted-foreground">
                      No processing orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {!isLoading && (
            <div className="mt-4 flex items-center justify-between">
              <Button
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page}</span>
              <Button
                variant="outline"
                disabled={!data?.data || data.data.length < 10}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
