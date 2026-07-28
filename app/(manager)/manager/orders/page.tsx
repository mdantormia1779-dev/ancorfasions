import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download, Filter, Search } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Order Management | Manager Dashboard",
};

const orders = [
  { id: "ORD-5321", customer: "Liam Johnson", date: "2023-06-23", amount: "$250.00", status: "Processing", items: 3 },
  { id: "ORD-5320", customer: "Olivia Smith", date: "2023-06-23", amount: "$150.00", status: "Shipped", items: 1 },
  { id: "ORD-5319", customer: "Noah Williams", date: "2023-06-22", amount: "$350.00", status: "Delivered", items: 4 },
  { id: "ORD-5318", customer: "Emma Brown", date: "2023-06-22", amount: "$450.00", status: "Pending", items: 2 },
  { id: "ORD-5317", customer: "Ava Davis", date: "2023-06-21", amount: "$550.00", status: "Processing", items: 5 },
  { id: "ORD-5316", customer: "William Garcia", date: "2023-06-21", amount: "$125.00", status: "Returned", items: 1 },
];

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Manage all customer orders and fulfillments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search orders..."
            className="w-full bg-background pl-8"
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      order.status === "Delivered" ? "default" :
                      order.status === "Processing" ? "secondary" :
                      order.status === "Returned" ? "destructive" :
                      order.status === "Shipped" ? "outline" : "default"
                    }
                  >
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{order.amount}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Link href={`/manager/orders/${order.id}`}>View Details</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
