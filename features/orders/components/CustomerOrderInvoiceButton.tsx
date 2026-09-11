"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { OrderInvoicePrint } from "@/features/orders/components/OrderInvoicePrint";
import { OrderWithDetails } from "@/types/oms";

export function CustomerOrderInvoiceButton({ order }: { order: any }) {
  const [showPrint, setShowPrint] = useState(false);

  // Map order data to OrderWithDetails structure if needed
  const mappedOrder: OrderWithDetails = {
    ...order,
    items: order.order_items || order.items || [],
    shippingAddress:
      order.order_addresses?.find((a: any) => a.address_type === "SHIPPING") ||
      order.shipping_address,
    billingAddress:
      order.order_addresses?.find((a: any) => a.address_type === "BILLING") ||
      order.billing_address,
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowPrint(true)}
        className="gap-1.5"
      >
        <Printer className="h-4 w-4" />
        Print Invoice
      </Button>

      {showPrint && (
        <OrderInvoicePrint
          order={mappedOrder}
          onClose={() => setShowPrint(false)}
        />
      )}
    </>
  );
}
