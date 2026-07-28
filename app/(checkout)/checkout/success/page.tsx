import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Package, Truck, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server-client';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Order Successful | Anchor Fashion',
  description: 'Thank you for your purchase.',
};

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: { order_id?: string } }) {
  const { order_id } = await searchParams;
  
  if (!order_id) {
    redirect('/');
  }

  const supabase = await createClient();
  const { data: order, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', order_id)
    .single();

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Order Not Found</h1>
        <p className="text-slate-500 mb-8">We couldn't find the details for this order.</p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="bg-white p-8 rounded-lg shadow-sm border text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Thank you for your order!</h1>
        <p className="text-slate-500 mb-6">
          Your order <span className="font-medium text-slate-900">{order.order_number}</span> has been placed successfully.
        </p>
        <p className="text-sm text-slate-500 mb-8">
          We've sent a confirmation email with your order details and tracking information.
        </p>

        {/* Simple Order Timeline representation */}
        <div className="flex justify-between items-center max-w-md mx-auto mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -z-10 transform -translate-y-1/2"></div>
          
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center mb-2">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Processing</span>
          </div>
          
          <div className="flex flex-col items-center opacity-40">
            <div className="w-10 h-10 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mb-2">
              <Truck className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Shipped</span>
          </div>
          
          <div className="flex flex-col items-center opacity-40">
            <div className="w-10 h-10 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center mb-2">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium">Delivered</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild variant="outline">
            <Link href="/account/orders">View My Orders</Link>
          </Button>
          <Button asChild>
            <Link href="/shop">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
