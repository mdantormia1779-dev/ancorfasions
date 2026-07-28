import { createAdminClient } from '@/lib/supabase/server';
import { Order, OrderAddress, OrderItem } from '@/types/checkout.types';

export class OrderRepository {
  /**
   * Create an order with items and addresses in a transaction-like way using Supabase Admin
   */
  static async createOrder(
    orderData: Partial<Order>,
    items: Partial<OrderItem>[],
    shippingAddress: Partial<OrderAddress>,
    billingAddress?: Partial<OrderAddress>
  ): Promise<Order> {
    const supabase = await createAdminClient();

    // 1. Create Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select('*')
      .single();

    if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);

    // 2. Create Shipping Address
    const { error: shippingError } = await supabase
      .from('order_addresses')
      .insert({ ...shippingAddress, order_id: order.id, address_type: 'SHIPPING' });

    if (shippingError) throw new Error(`Failed to create shipping address: ${shippingError.message}`);

    // 3. Create Billing Address
    if (billingAddress) {
      const { error: billingError } = await supabase
        .from('order_addresses')
        .insert({ ...billingAddress, order_id: order.id, address_type: 'BILLING' });

      if (billingError) throw new Error(`Failed to create billing address: ${billingError.message}`);
    }

    // 4. Create Order Items
    const itemsData = items.map(item => ({ ...item, order_id: order.id }));
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsData);

    if (itemsError) throw new Error(`Failed to create order items: ${itemsError.message}`);
    
    // 5. Create Order Status History
    await supabase.from('order_status_history').insert({
      order_id: order.id,
      status: order.status,
      notes: 'Order placed successfully',
      created_by: order.user_id,
    });

    // 6. Fetch complete order
    return await this.getOrderById(order.id) as Order;
  }

  /**
   * Get an order by ID
   */
  static async getOrderById(orderId: string): Promise<Order | null> {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        addresses:order_addresses(*)
      `)
      .eq('id', orderId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch order: ${error.message}`);
    }
    
    if (data) {
      // Map addresses to shipping and billing
      data.shipping_address = data.addresses?.find((a: any) => a.address_type === 'SHIPPING');
      data.billing_address = data.addresses?.find((a: any) => a.address_type === 'BILLING');
      delete data.addresses;
    }

    return data as Order | null;
  }
  
  /**
   * Get an order by Order Number
   */
  static async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const supabase = await createAdminClient();
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(*),
        addresses:order_addresses(*)
      `)
      .eq('order_number', orderNumber)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch order: ${error.message}`);
    }
    
    if (data) {
      data.shipping_address = data.addresses?.find((a: any) => a.address_type === 'SHIPPING');
      data.billing_address = data.addresses?.find((a: any) => a.address_type === 'BILLING');
      delete data.addresses;
    }

    return data as Order | null;
  }
}
