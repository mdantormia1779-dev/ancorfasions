import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customer_name, customer_phone, customer_email, delivery_address, city, payment_method, total_amount, delivery_fee, items, user_id } = body;

    // Validate required fields
    if (!customer_name || !customer_phone || !delivery_address || !city || !payment_method || !total_amount || !items || items.length === 0) {
      return NextResponse.json({ error: 'Missing required order fields' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Generate a unique order number (e.g., ORD-timestamp-random)
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const { data, error } = await supabase
      .from('customer_orders')
      .insert([
        {
          order_number: orderNumber,
          customer_name,
          customer_phone,
          customer_email,
          delivery_address,
          city,
          payment_method,
          total_amount,
          delivery_fee,
          items,
          user_id: user_id || null, // Null if guest checkout
          payment_status: payment_method === 'COD' ? 'Pending' : 'Awaiting Verification',
          status: 'Processing'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Order created successfully', order: data });
  } catch (error) {
    console.error('Unexpected error creating order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
