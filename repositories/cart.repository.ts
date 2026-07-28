import { createClient } from '@/lib/supabase/server-client';
import { Cart, CartItem } from '@/types/checkout.types';

export class CartRepository {
  /**
   * Fetch cart by ID
   */
  async getCartById(cartId: string): Promise<Cart | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('carts')
      .select(`
        *,
        items:cart_items(
          *,
          product:products(id, title, slug, price, sale_price, main_image_url, stock_quantity),
          variant:product_variants(id, sku, price, sale_price, stock_quantity, attributes)
        )
      `)
      .eq('id', cartId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error('Error fetching cart:', error);
      throw new Error('Failed to fetch cart');
    }

    return data as Cart;
  }

  /**
   * Fetch cart by user ID
   */
  async getCartByUserId(userId: string): Promise<Cart | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('carts')
      .select(`
        *,
        items:cart_items(
          *,
          product:products(id, title, slug, price, sale_price, main_image_url, stock_quantity),
          variant:product_variants(id, sku, price, sale_price, stock_quantity, attributes)
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('Error fetching user cart:', error);
      throw new Error('Failed to fetch user cart');
    }

    return data as Cart;
  }

  /**
   * Create a new cart
   */
  async createCart(userId?: string, sessionId?: string): Promise<Cart> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('carts')
      .insert({
        user_id: userId || null,
        session_id: sessionId || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating cart:', error);
      throw new Error('Failed to create cart');
    }

    return data as Cart;
  }

  /**
   * Merge guest cart into user cart
   */
  async mergeCart(guestCartId: string, userId: string): Promise<void> {
    const supabase = await createClient();
    
    // Check if user already has a cart
    let userCart = await this.getCartByUserId(userId);
    
    if (!userCart) {
      // Just update the guest cart to belong to user
      const { error } = await supabase
        .from('carts')
        .update({ user_id: userId, session_id: null })
        .eq('id', guestCartId);
        
      if (error) throw new Error('Failed to merge cart');
      return;
    }

    // Move all items from guest cart to user cart
    const { data: guestItems } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', guestCartId);

    if (guestItems && guestItems.length > 0) {
      for (const item of guestItems) {
        // Check if item already exists in user cart
        const { data: existingItem } = await supabase
          .from('cart_items')
          .select('id, quantity')
          .eq('cart_id', userCart.id)
          .eq('product_id', item.product_id)
          .eq('variant_id', item.variant_id || null)
          .single();

        if (existingItem) {
          // Add quantities
          await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + item.quantity })
            .eq('id', existingItem.id);
        } else {
          // Reassign cart_id
          await supabase
            .from('cart_items')
            .update({ cart_id: userCart.id })
            .eq('id', item.id);
        }
      }
    }

    // Delete guest cart
    await supabase.from('carts').delete().eq('id', guestCartId);
  }

  /**
   * Add item to cart
   */
  async addItem(cartId: string, productId: string, quantity: number, variantId?: string): Promise<CartItem> {
    const supabase = await createClient();
    
    // Check if already exists
    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('product_id', productId)
      .eq(variantId ? 'variant_id' : 'variant_id', variantId ? variantId : null)
      .single();

    if (existing) {
      return this.updateItemQuantity(existing.id, existing.quantity + quantity);
    }

    const { data, error } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cartId,
        product_id: productId,
        variant_id: variantId || null,
        quantity,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding cart item:', error);
      throw new Error('Failed to add item to cart');
    }

    return data as CartItem;
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(itemId: string, quantity: number): Promise<CartItem> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      console.error('Error updating cart item:', error);
      throw new Error('Failed to update item quantity');
    }

    return data as CartItem;
  }

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error('Error removing cart item:', error);
      throw new Error('Failed to remove item from cart');
    }
  }

  /**
   * Clear all items in cart
   */
  async clearCart(cartId: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cartId);

    if (error) {
      console.error('Error clearing cart:', error);
      throw new Error('Failed to clear cart');
    }
  }
}
