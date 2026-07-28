import { createAdminClient } from '@/lib/supabase/server';
import { Cart, CartItem } from '@/types/checkout.types';

export class CartRepository {
  /**
   * Get a cart by User ID or Session ID
   */
  static async getCart(userId?: string | null, sessionId?: string | null): Promise<Cart | null> {
    const supabase = await createAdminClient();

    let query = supabase
      .from('carts')
      .select('*, items:cart_items(*, product:products(id, name, slug, base_price, compare_at_price, product_media(url, is_primary)), variant:variants(id, sku, price_override, attributes))');

    if (userId) {
      query = query.eq('user_id', userId);
    } else if (sessionId) {
      query = query.eq('session_id', sessionId);
    } else {
      return null;
    }

    const { data, error } = await query.single();
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch cart: ${error.message}`);
    }

    return data as Cart | null;
  }

  /**
   * Create a new cart
   */
  static async createCart(userId?: string | null, sessionId?: string | null): Promise<Cart> {
    const supabase = await createAdminClient();

    const payload: any = {};
    if (userId) payload.user_id = userId;
    if (sessionId) payload.session_id = sessionId;

    const { data, error } = await supabase
      .from('carts')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create cart: ${error.message}`);
    }

    return { ...data, items: [] } as Cart;
  }

  /**
   * Merge guest cart into user cart
   */
  static async mergeCart(sessionId: string, userId: string): Promise<void> {
    const supabase = await createAdminClient();

    // 1. Find guest cart
    const guestCart = await this.getCart(null, sessionId);
    if (!guestCart || !guestCart.items || guestCart.items.length === 0) {
      return; // Nothing to merge
    }

    // 2. Find or create user cart
    let userCart = await this.getCart(userId);
    if (!userCart) {
      userCart = await this.createCart(userId);
    }

    // 3. Move items from guest cart to user cart
    for (const item of guestCart.items) {
      // Check if user cart already has this product/variant
      const existingItem = userCart.items?.find(i => i.product_id === item.product_id && i.variant_id === item.variant_id);
      
      if (existingItem) {
        // Update quantity
        await supabase
          .from('cart_items')
          .update({ quantity: existingItem.quantity + item.quantity })
          .eq('id', existingItem.id);
      } else {
        // Insert new item linked to user cart
        await supabase
          .from('cart_items')
          .insert({
            cart_id: userCart.id,
            product_id: item.product_id,
            variant_id: item.variant_id,
            quantity: item.quantity,
          });
      }
    }

    // 4. Delete guest cart
    await supabase.from('carts').delete().eq('id', guestCart.id);
  }

  /**
   * Add item to cart
   */
  static async addItem(cartId: string, productId: string, variantId: string | null, quantity: number): Promise<void> {
    const supabase = await createAdminClient();

    // Check if item already exists in cart
    let query = supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', productId);
      
    if (variantId) {
      query = query.eq('variant_id', variantId);
    } else {
      query = query.is('variant_id', null);
    }

    const { data: existingItem } = await query.single();

    if (existingItem) {
      // Update quantity
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);
        
      if (error) throw new Error(`Failed to update cart item: ${error.message}`);
    } else {
      // Insert new
      const payload: any = {
        cart_id: cartId,
        product_id: productId,
        quantity,
      };
      if (variantId) payload.variant_id = variantId;

      const { error } = await supabase
        .from('cart_items')
        .insert(payload);
        
      if (error) throw new Error(`Failed to add cart item: ${error.message}`);
    }
  }

  /**
   * Update item quantity
   */
  static async updateItemQuantity(itemId: string, quantity: number): Promise<void> {
    const supabase = await createAdminClient();
    
    if (quantity <= 0) {
      await this.removeItem(itemId);
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId);

    if (error) throw new Error(`Failed to update quantity: ${error.message}`);
  }

  /**
   * Remove item from cart
   */
  static async removeItem(itemId: string): Promise<void> {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) throw new Error(`Failed to remove item: ${error.message}`);
  }

  /**
   * Clear cart
   */
  static async clearCart(cartId: string): Promise<void> {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    if (error) throw new Error(`Failed to clear cart: ${error.message}`);
  }
}
