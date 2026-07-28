import { createClient } from '@/lib/supabase/server';
import { Order, OrderStatus } from '@/types/oms';

export class OrderRepository {
  async getOrderById(id: string): Promise<Order | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching order by ID:', error);
      return null;
    }
    return data as Order;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_number', orderNumber)
      .single();

    if (error) {
      console.error('Error fetching order by number:', error);
      return null;
    }
    return data as Order;
  }

  async getOrders(options?: {
    customerId?: string;
    status?: OrderStatus;
    page?: number;
    limit?: number;
  }) {
    const supabase = await createClient();
    let query = supabase.from('orders').select('*', { count: 'exact' });

    if (options?.customerId) {
      query = query.eq('user_id', options.customerId);
    }
    if (options?.status) {
      query = query.eq('status', options.status);
    }

    const page = options?.page || 1;
    const limit = options?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch orders: ${error.message}`);
    }

    return {
      data: data as Order[],
      count: count || 0,
    };
  }

  async createOrder(
    orderData: Partial<Order> & { order_number: string }
  ): Promise<Order> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create order: ${error.message}`);
    }
    return data as Order;
  }

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
    updatedBy?: string
  ): Promise<Order> {
    const supabase = await createClient();
    const updateData: Partial<Order> = { status };
    if (updatedBy) {
      updateData.updated_by = updatedBy;
    }

    const { data, error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update order status: ${error.message}`);
    }
    return data as Order;
  }
}
