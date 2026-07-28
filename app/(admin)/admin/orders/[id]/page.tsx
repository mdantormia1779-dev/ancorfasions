'use client';

import { useOrderDetails } from '@/hooks/oms/use-order-details';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useParams } from 'next/navigation';
import { OrderStatus } from '@/types/oms';

export default function AdminOrderDetailsPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { order, isLoading, updateStatus, isUpdatingStatus } = useOrderDetails(orderId);

  if (isLoading) return <div className="p-6">Loading order details...</div>;
  if (!order) return <div className="p-6">Order not found</div>;

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    try {
      await updateStatus({ order_id: order.id, new_status: newStatus });
    } catch (e: any) {
      alert(`Failed to update status: ${e.message}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Order {order.order_number}</h1>
        <div className="flex space-x-2">
          <Button variant="outline">Print Invoice</Button>
          <Button variant="outline">Print Packing Slip</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Order Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center border-b pb-4">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-sm text-gray-500">SKU: {item.sku} {item.variant_name ? `| ${item.variant_name}` : ''}</p>
                  </div>
                  <div className="text-right">
                    <p>${item.unit_price} x {item.quantity}</p>
                    <p className="font-bold">${item.line_total}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between"><span>Subtotal:</span> <span>${order.subtotal}</span></div>
                <div className="flex justify-between"><span>Shipping:</span> <span>${order.shipping_total}</span></div>
                <div className="flex justify-between"><span>Tax:</span> <span>${order.tax_total}</span></div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span> <span>${order.grand_total}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="font-medium">Current:</span>
                <Badge className="text-sm">{order.status}</Badge>
              </div>
              
              {/* Simplistic State Machine Controls */}
              <div className="pt-4 border-t space-y-2">
                <p className="text-sm font-medium">Update Status</p>
                <div className="flex flex-wrap gap-2">
                  {order.status === 'paid' && (
                    <Button size="sm" onClick={() => handleStatusUpdate('confirmed')} disabled={isUpdatingStatus}>Confirm Order</Button>
                  )}
                  {order.status === 'confirmed' && (
                    <Button size="sm" onClick={() => handleStatusUpdate('preparing')} disabled={isUpdatingStatus}>Start Preparing</Button>
                  )}
                  {order.status === 'preparing' && (
                    <Button size="sm" onClick={() => handleStatusUpdate('picking')} disabled={isUpdatingStatus}>Picking</Button>
                  )}
                  {order.status === 'picking' && (
                    <Button size="sm" onClick={() => handleStatusUpdate('packing')} disabled={isUpdatingStatus}>Packing</Button>
                  )}
                  {order.status === 'packing' && (
                    <Button size="sm" onClick={() => handleStatusUpdate('ready_for_shipment')} disabled={isUpdatingStatus}>Ready for Shipment</Button>
                  )}
                  {order.status === 'ready_for_shipment' && (
                    <Button size="sm" onClick={() => handleStatusUpdate('shipped')} disabled={isUpdatingStatus}>Mark Shipped</Button>
                  )}
                  {order.status === 'shipped' && (
                    <Button size="sm" onClick={() => handleStatusUpdate('delivered')} disabled={isUpdatingStatus}>Mark Delivered</Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => handleStatusUpdate('cancelled')} disabled={isUpdatingStatus}>Cancel Order</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">Customer ID: {order.customer_id || 'Guest'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
