import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, Truck } from "lucide-react";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const metadata: Metadata = {
  title: "Order Details | Manager Dashboard",
};

export default function OrderDetailsPage({ params }: { params: { id: string } }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon">
            <Link href="/manager/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order {params.id}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span>Placed on June 23, 2023 at 10:24 AM</span>
              <span>•</span>
              <Badge variant="secondary">Processing</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
          <Button>
            <Truck className="mr-2 h-4 w-4" />
            Fulfill Order
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center">Image</div>
                    <div>
                      <p className="font-medium">Classic Oxford Shirt</p>
                      <p className="text-sm text-muted-foreground">Color: White, Size: M</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$125.00</p>
                    <p className="text-sm text-muted-foreground">Qty: 2</p>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between font-medium pt-2">
                  <span>Subtotal</span>
                  <span>$250.00</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>$15.00</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>$20.00</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  <span>$285.00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                 <div className="flex gap-4">
                   <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                   <div>
                     <p className="font-medium">Order Processing</p>
                     <p className="text-sm text-muted-foreground">June 23, 2023 - 11:30 AM</p>
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <div className="w-2 h-2 rounded-full bg-muted mt-2"></div>
                   <div>
                     <p className="font-medium">Payment Confirmed</p>
                     <p className="text-sm text-muted-foreground">June 23, 2023 - 10:25 AM</p>
                   </div>
                 </div>
                 <div className="flex gap-4">
                   <div className="w-2 h-2 rounded-full bg-muted mt-2"></div>
                   <div>
                     <p className="font-medium">Order Placed</p>
                     <p className="text-sm text-muted-foreground">June 23, 2023 - 10:24 AM</p>
                   </div>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-1 flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium">Liam Johnson</p>
                <p className="text-sm text-muted-foreground">liam.johnson@example.com</p>
                <p className="text-sm text-muted-foreground">+1 555-0192</p>
              </div>
              <Separator />
              <div>
                <p className="font-medium mb-1">Shipping Address</p>
                <p className="text-sm text-muted-foreground">
                  123 Fashion Ave<br />
                  Suite 4B<br />
                  New York, NY 10001<br />
                  United States
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Order Status</label>
                <Select defaultValue="processing">
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Save Changes</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
