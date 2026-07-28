import { createAdminClient } from '@/lib/supabase/server';
import { Wishlist, WishlistItem } from '@/types/checkout.types';

export class WishlistRepository {
  /**
   * Get a user's wishlist
   */
  static async getWishlist(userId: string): Promise<Wishlist | null> {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from('wishlists')
      .select('*, items:wishlist_items(*, product:products(id, name, slug, base_price, compare_at_price, product_media(url, is_primary)))')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to fetch wishlist: ${error.message}`);
    }

    return data as Wishlist | null;
  }

  /**
   * Create a new wishlist for a user
   */
  static async createWishlist(userId: string): Promise<Wishlist> {
    const supabase = await createAdminClient();

    const { data, error } = await supabase
      .from('wishlists')
      .insert({ user_id: userId, name: 'My Wishlist', is_default: true })
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to create wishlist: ${error.message}`);
    }

    return { ...data, items: [] } as Wishlist;
  }

  /**
   * Add item to wishlist
   */
  static async addItem(wishlistId: string, productId: string, variantId?: string | null): Promise<void> {
    const supabase = await createAdminClient();

    // Check if it already exists
    let query = supabase
      .from('wishlist_items')
      .select('id')
      .eq('wishlist_id', wishlistId)
      .eq('product_id', productId);
      
    const { data: existing } = await query.single();
    
    if (existing) {
      return; // Already in wishlist
    }

    const payload: any = {
      wishlist_id: wishlistId,
      product_id: productId,
    };
    if (variantId) payload.variant_id = variantId;

    const { error } = await supabase
      .from('wishlist_items')
      .insert(payload);

    if (error) {
      throw new Error(`Failed to add item to wishlist: ${error.message}`);
    }
  }

  /**
   * Remove item from wishlist
   */
  static async removeItem(itemId: string): Promise<void> {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('id', itemId);

    if (error) {
      throw new Error(`Failed to remove item from wishlist: ${error.message}`);
    }
  }

  /**
   * Remove item by product ID (for a specific wishlist)
   */
  static async removeItemByProductId(wishlistId: string, productId: string): Promise<void> {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('wishlist_id', wishlistId)
      .eq('product_id', productId);

    if (error) {
      throw new Error(`Failed to remove item from wishlist: ${error.message}`);
    }
  }
}
