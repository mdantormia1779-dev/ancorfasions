import { createClient } from '@/lib/supabase/server';
import { OrderItem } from '@/types/oms';

export class OrderItemsRepository {
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching order items:', error);
      return [];
    }
    return data as OrderItem[];
  }

  async createOrderItems(items: Omit<OrderItem, 'id' | 'created_at'>[]): Promise<OrderItem[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('order_items')
      .insert(items)
      .select();

    if (error) {
      throw new Error(`Failed to create order items: ${error.message}`);
    }
    return data as OrderItem[];
  }
}
