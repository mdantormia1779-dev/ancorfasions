import { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderRepository } from "@/lib/repositories/oms/order.repository";
import { createClient } from "@/lib/supabase/server-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Package,
  Truck,
  Home,
  Download,
  XCircle,
  RefreshCcw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Order Details | Anchor Fashion",
};

export default async function OrderDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await params;
  const supabase = await createClient();

  // We fetch directly from Supabase since we need the items as well,
  // and the repository might not join items by default.
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items(*),
      order_addresses(*),
      order_status_history(*)
    `
    )
    .eq("id", id)
    .single();

  if (error || !order) {
    notFound();
  }

  const shippingAddress = order.order_addresses?.find(
    (a: any) => a.address_type === "SHIPPING"
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/account/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">
          Order {order.order_number}
        </h1>
        <Badge
          variant={
            order.status === "COMPLETED" || order.status === "DELIVERED"
              ? "default"
              : "secondary"
          }
          className="text-sm"
        >
          {order.status.replace(/_/g, " ")}
        </Badge>
        <div className="flex-1"></div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Invoice
          </Button>
          {(order.status === "PENDING" || order.status === "PROCESSING") && (
            <Button variant="destructive" size="sm">
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Order
            </Button>
          )}
          {(order.status === "COMPLETED" || order.status === "DELIVERED") && (
            <Button variant="outline" size="sm">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Return Item
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {order.order_items?.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-4"
                  >
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      {item.variant_name && (
                        <p className="text-sm text-slate-500">
                          {item.variant_name}
                        </p>
                      )}
                      <p className="text-sm text-slate-500">
                        Qty: {item.quantity} x {formatCurrency(item.unit_price)}
                      </p>
                    </div>
                    <div className="font-medium">
                      {formatCurrency(item.total_price)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.order_status_history
                  ?.sort(
                    (a: any, b: any) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                  )
                  .map((history: any) => (
                    <div key={history.id} className="flex items-start gap-4">
                      <div className="mt-2 h-2 w-2 rounded-full bg-slate-400"></div>
                      <div>
                        <p className="font-medium">
                          {history.status.replace(/_/g, " ")}
                        </p>
                        <p className="text-sm text-slate-500">
                          {new Date(history.created_at).toLocaleString()}
                        </p>
                        {history.notes && (
                          <p className="mt-1 text-sm">{history.notes}</p>
                        )}
                      </div>
                    </div>
                  ))}
                {(!order.order_status_history ||
                  order.order_status_history.length === 0) && (
                  <p className="text-slate-500">
                    No timeline events available.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shipping</span>
                  <span>{formatCurrency(order.shipping_fee)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 text-base font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {shippingAddress && (
            <Card>
              <CardHeader>
                <CardTitle>Shipping Address</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p className="font-medium">
                  {shippingAddress.first_name} {shippingAddress.last_name}
                </p>
                <p>{shippingAddress.phone}</p>
                <p>{shippingAddress.email}</p>
                <p className="mt-2">{shippingAddress.address_line_1}</p>
                {shippingAddress.address_line_2 && (
                  <p>{shippingAddress.address_line_2}</p>
                )}
                <p>
                  {shippingAddress.city}, {shippingAddress.postal_code}
                </p>
                <p>{shippingAddress.country}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
