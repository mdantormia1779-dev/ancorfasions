import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Printer, Truck } from "lucide-react";
import Link from "next/link";
import { getOrderDetailsAction } from "@/app/actions/oms/order.actions";
import { notFound } from "next/navigation";
import { OrderStatusUpdater } from "./order-status-updater";

export const metadata: Metadata = {
  title: "Order Details | Manager Dashboard",
};

export default async function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const result = await getOrderDetailsAction(id);

  if (!result.success || !result.data) {
    notFound();
  }

  const order = result.data;
  const items = order.items || [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/manager/orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Order {order.order_number}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Placed on {new Date(order.created_at).toLocaleString()}</span>
              <span>•</span>
              <Badge variant="secondary" className="uppercase">{order.status}</Badge>
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

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="col-span-1 flex flex-col gap-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.length === 0 ? (
                  <p className="text-muted-foreground">No items in this order.</p>
                ) : (
                  items.map((item: any, idx: number) => (
                    <div key={idx}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                            Img
                          </div>
                          <div>
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.variant_name || item.sku}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">৳{item.unit_price}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      {idx < items.length - 1 && <Separator className="my-4" />}
                    </div>
                  ))
                )}
                
                <Separator className="mt-4" />
                <div className="flex items-center justify-between pt-2 font-medium">
                  <span>Subtotal</span>
                  <span>৳{order.subtotal}</span>
                </div>
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Shipping</span>
                  <span>৳{order.shipping_total}</span>
                </div>
                {order.discount_total > 0 && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Discount</span>
                    <span>-৳{order.discount_total}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>৳{order.tax_total}</span>
                </div>
                <Separator className="my-2" />
                <div className="flex items-center justify-between pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span>৳{order.grand_total}</span>
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
                {order.status === "delivered" && (
                  <div className="flex gap-4">
                    <div className="mt-2 h-2 w-2 rounded-full bg-primary"></div>
                    <div>
                      <p className="font-medium">Delivered</p>
                      <p className="text-sm text-muted-foreground">
                        {order.updated_at ? new Date(order.updated_at).toLocaleString() : ""}
                      </p>
                    </div>
                  </div>
                )}
                {order.status !== "draft" && (
                  <div className="flex gap-4">
                    <div className="mt-2 h-2 w-2 rounded-full bg-primary"></div>
                    <div>
                      <p className="font-medium">Order Placed</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
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
                <p className="font-medium">Customer ID: {order.customer_id || "Guest"}</p>
                <p className="text-sm text-muted-foreground">
                  (User data resolution requires CRM join)
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
