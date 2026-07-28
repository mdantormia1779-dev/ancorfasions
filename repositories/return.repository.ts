// ============================================================================
// Return Repository
// ============================================================================

import { createAdminClient } from '@/lib/supabase/admin-client';
import {
  ReturnRequest,
  ReturnItem,
  ReturnWithItems,
  ReturnFilters,
  PaginatedResult,
} from '@/types/shipping.types';

export class ReturnRepository {
  private getClient() {
    return createAdminClient();
  }

  /**
   * Create a return with its items.
   */
  async createReturn(
    data: Omit<Partial<ReturnRequest>, 'id' | 'created_at' | 'updated_at'>,
    items: Omit<Partial<ReturnItem>, 'id' | 'return_id' | 'created_at'>[]
  ): Promise<ReturnWithItems> {
    const supabase = this.getClient();

    const { data: ret, error } = await supabase
      .from('returns')
      .insert(data as any)
      .select()
      .single();

    if (error) throw new Error(`Create return failed: ${error.message}`);

    if (items.length > 0) {
      const { error: itemError } = await supabase
        .from('return_items')
        .insert(items.map((item) => ({ ...item, return_id: ret.id })) as any);

      if (itemError) console.error('Failed to insert return items:', itemError);
    }

    return this.getReturnWithItems(ret.id) as Promise<ReturnWithItems>;
  }

  /**
   * Update return fields.
   */
  async updateReturn(
    id: string,
    data: Partial<ReturnRequest> & { [key: string]: any }
  ): Promise<ReturnRequest> {
    const supabase = this.getClient();

    const { data: updated, error } = await supabase
      .from('returns')
      .update(data as any)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(`Update return failed: ${error.message}`);
    return updated as ReturnRequest;
  }

  /**
   * Get return by ID.
   */
  async getReturnById(id: string): Promise<ReturnRequest | null> {
    const supabase = this.getClient();

    const { data, error } = await supabase
      .from('returns')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Get return failed: ${error.message}`);
    return data as ReturnRequest | null;
  }

  /**
   * Get return with items.
   */
  async getReturnWithItems(id: string): Promise<ReturnWithItems | null> {
    const supabase = this.getClient();

    const { data, error } = await supabase
      .from('returns')
      .select(`
        *,
        items:return_items(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) throw new Error(`Get return with items failed: ${error.message}`);
    return data as ReturnWithItems | null;
  }

  /**
   * Get returns by order.
   */
  async getReturnsByOrderId(orderId: string): Promise<ReturnRequest[]> {
    const supabase = this.getClient();

    const { data, error } = await supabase
      .from('returns')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Get returns by order failed: ${error.message}`);
    return (data ?? []) as ReturnRequest[];
  }

  /**
   * List returns with pagination and filters.
   */
  async listReturns(filters: ReturnFilters): Promise<PaginatedResult<ReturnRequest>> {
    const supabase = this.getClient();
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('returns')
      .select('*', { count: 'exact' });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.dateFrom) query = query.gte('created_at', filters.dateFrom);
    if (filters.dateTo) query = query.lte('created_at', filters.dateTo);
    if (filters.search) {
      query = query.or(`return_number.ilike.%${filters.search}%`);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(`List returns failed: ${error.message}`);

    return {
      data: (data ?? []) as ReturnRequest[],
      total: count ?? 0,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    };
  }

  /**
   * Get return items for a return.
   */
  async getReturnItems(returnId: string): Promise<ReturnItem[]> {
    const supabase = this.getClient();

    const { data, error } = await supabase
      .from('return_items')
      .select('*')
      .eq('return_id', returnId);

    if (error) throw new Error(`Get return items failed: ${error.message}`);
    return (data ?? []) as ReturnItem[];
  }

  /**
   * Mark a return item as restocked.
   */
  async markItemRestocked(returnItemId: string): Promise<void> {
    const supabase = this.getClient();
    await supabase
      .from('return_items')
      .update({ restocked: true } as any)
      .eq('id', returnItemId);
  }
}
