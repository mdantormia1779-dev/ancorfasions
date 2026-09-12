import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { OrderRepository } from "@/lib/repositories/oms/order.repository";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Package,
  Truck,
  Home,
  XCircle,
  RefreshCcw,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { CustomerOrderInvoiceButton } from "@/features/orders/components/CustomerOrderInvoiceButton";
import { ReturnRequestDialog } from "@/components/returns/return-request-dialog";

export const metadata: Metadata = {
  title: "Order Details | Anchor Fashion",
};

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?redirect=/account/orders");
  }

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  let orderQuery = supabase
    .from("orders")
    .select(
      `
      *,
      order_items(*),
      order_addresses(*),
      order_status_history(*)
    `
    );

  if (isUuid) {
    orderQuery = orderQuery.eq("id", id);
  } else {
    orderQuery = orderQuery.eq("order_number", id);
  }

  const { data: order, error } = await orderQuery.maybeSingle();

  if (error || !order) {
    notFound();
  }

  // Fetch any return requests for this order
  const { data: orderReturns } = await supabase
    .from("returns")
    .select("*")
    .eq("order_id", order.id)
    .order("created_at", { ascending: false });

  const activeReturn = orderReturns?.find((r: any) =>
    ["requested", "approved", "pickup_scheduled", "picked_up", "in_transit", "received"].includes(
      r.status
    )
  );

  // Ensure customer can only view their own orders
  if (order.customer_id && order.customer_id !== user.id) {
    // Check if user is staff/admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const isStaff = ["ADMIN", "MANAGER", "SUPER_ADMIN", "STAFF"].includes(
      profile?.role?.toUpperCase() || ""
    );
    if (!isStaff) {
      notFound();
    }
  }

  const shippingAddress = order.order_addresses?.find(
    (a: any) => a.address_type === "SHIPPING"
  );

  const isDelivered =
    order.status?.toUpperCase() === "COMPLETED" ||
    order.status?.toUpperCase() === "DELIVERED";

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
          variant={isDelivered ? "default" : "secondary"}
          className="text-sm"
        >
          {order.status.replace(/_/g, " ")}
        </Badge>
        <div className="flex-1"></div>
        <div className="flex items-center gap-2">
          <CustomerOrderInvoiceButton order={order} />
          {(order.status === "PENDING" || order.status === "PROCESSING") && (
            <Button variant="destructive" size="sm">
              <XCircle className="mr-2 h-4 w-4" />
              Cancel Order
            </Button>
          )}
          {activeReturn ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/account/returns/${activeReturn.id}`}>
                <RefreshCcw className="mr-2 h-4 w-4 text-primary" />
                Return {activeReturn.status.toUpperCase()} · View
              </Link>
            </Button>
          ) : isDelivered ? (
            <ReturnRequestDialog
              orderId={order.id}
              orderNumber={order.order_number}
            />
          ) : null}
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
                      {formatCurrency(item.line_total ?? item.total_price ?? (Number(item.quantity) * Number(item.unit_price)))}
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
                  <span>{formatCurrency(order.subtotal ?? 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Shipping</span>
                  <span>{formatCurrency(order.shipping_total ?? order.shipping_fee ?? 0)}</span>
                </div>
                {Number(order.discount_total || order.discount_amount || 0) > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(order.discount_total || order.discount_amount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2 text-base font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(order.grand_total ?? order.total_amount ?? 0)}</span>
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
                  {shippingAddress.recipient_name || [shippingAddress.first_name, shippingAddress.last_name].filter(Boolean).join(" ") || "Recipient"}
                </p>
                {shippingAddress.phone && <p>{shippingAddress.phone}</p>}
                {shippingAddress.email && <p>{shippingAddress.email}</p>}
                <p className="mt-2">{shippingAddress.address_line_1}</p>
                {shippingAddress.address_line_2 && (
                  <p>{shippingAddress.address_line_2}</p>
                )}
                <p>
                  {[shippingAddress.city, shippingAddress.postal_code || shippingAddress.zip].filter(Boolean).join(", ")}
                </p>
                {shippingAddress.country && <p>{shippingAddress.country}</p>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
