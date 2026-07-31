import { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, Package, Truck, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server-client";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Order Successful | Anchor Fashion",
  description: "Thank you for your purchase.",
};

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { order_id?: string };
}) {
  const { order_id } = await searchParams;

  if (!order_id) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", order_id)
    .single();

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-4 text-3xl font-bold">Order Not Found</h1>
        <p className="mb-8 text-slate-500">
          We couldn't find the details for this order.
        </p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-12">
      <div className="rounded-lg border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle className="h-8 w-8" />
        </div>
        <h1 className="mb-2 text-3xl font-bold">Thank you for your order!</h1>
        <p className="mb-6 text-slate-500">
          Your order{" "}
          <span className="font-medium text-slate-900">
            {order.order_number}
          </span>{" "}
          has been placed successfully.
        </p>
        <p className="mb-8 text-sm text-slate-500">
          We've sent a confirmation email with your order details and tracking
          information.
        </p>

        {/* Simple Order Timeline representation */}
        <div className="relative mx-auto mb-12 flex max-w-md items-center justify-between">
          <div className="absolute left-0 top-1/2 -z-10 h-1 w-full -translate-y-1/2 transform bg-slate-100"></div>

          <div className="flex flex-col items-center">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-white">
              <Package className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">Processing</span>
          </div>

          <div className="flex flex-col items-center opacity-40">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500">
              <Truck className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">Shipped</span>
          </div>

          <div className="flex flex-col items-center opacity-40">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-slate-500">
              <Home className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">Delivered</span>
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild variant="outline">
            <Link href="/account/orders">View My Orders</Link>
          </Button>
          <Button asChild>
            <Link href="/products">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
