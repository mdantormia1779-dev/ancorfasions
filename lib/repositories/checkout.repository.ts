import { createAdminClient } from '@/lib/supabase/server';
import { CheckoutSession, CheckoutStep } from '@/types/checkout.types';

export class CheckoutRepository {
  /**
   * Get a checkout session by User ID or Guest Email (with Cart ID)
   */
  static async getSession(cartId: string, userId?: string | null): Promise<CheckoutSession | null> {
    const supabase = await createAdminClient();

    let query = supabase
      .from('checkout_sessions')
      .select('*')
      .eq('cart_id', cartId);

    if (userId) {
      query = query.eq('user_id', userId);
    } else {
      query = query.is('user_id', null);
    }

    const { data, error } = await query.order('created_at', { ascending: false }).limit(1).single();
    
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch checkout session: ${error.message}`);
    }

    return data as CheckoutSession | null;
  }

  /**
   * Create or replace a checkout session
   */
  static async createSession(cartId: string, userId?: string | null, guestEmail?: string | null): Promise<CheckoutSession> {
    const supabase = await createAdminClient();

    // First delete any existing session for this cart
    await supabase.from('checkout_sessions').delete().eq('cart_id', cartId);

    const payload: any = {
      cart_id: cartId,
      current_step: 'INFORMATION',
    };
    
    if (userId) payload.user_id = userId;
    if (guestEmail) payload.guest_email = guestEmail;

    const { data, error } = await supabase
      .from('checkout_sessions')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }

    return data as CheckoutSession;
  }

  /**
   * Update checkout session step and data
   */
  static async updateSession(sessionId: string, updates: Partial<CheckoutSession>): Promise<CheckoutSession> {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from('checkout_sessions')
      .update(updates)
      .eq('id', sessionId)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update checkout session: ${error.message}`);
    }

    return data as CheckoutSession;
  }
  
  /**
   * Delete session
   */
  static async deleteSession(sessionId: string): Promise<void> {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from('checkout_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) {
      throw new Error(`Failed to delete checkout session: ${error.message}`);
    }
  }
}
