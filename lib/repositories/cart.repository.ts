import { createAdminClient } from "@/lib/supabase/server";
import { Cart, CartItem } from "@/types/checkout.types";

export class CartRepository {
  /**
   * Get a cart by User ID, Session ID, or direct Cart ID
   */
  static async getCart(
    userId?: string | null,
    sessionId?: string | null,
    cartId?: string | null
  ): Promise<Cart | null> {
    const supabase = await createAdminClient();

    let query = supabase
      .from("carts")
      .select(
        "*, items:cart_items(*, variant:variants(id, sku, price_override, sale_price, attributes, is_active, product:products(id, name, slug, base_price, sale_price, product_media(url, is_primary, display_order, variant_id))))"
      );

    if (cartId) {
      query = query.eq("id", cartId);
    } else if (userId) {
      query = query.eq("user_id", userId);
    } else if (sessionId) {
      query = query.eq("session_id", sessionId);
    } else {
      return null;
    }

    const { data, error } = await query
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch cart: ${error.message}`);
    }

    if (!data) return null;

    if (data.items) {
      data.items = data.items.map((item: any) => {
        const prod = item.variant?.product;
        return {
          ...item,
          product_id: prod?.id || null,
          product: prod
            ? {
                ...prod,
                title: prod.name,
                price: prod.base_price,
                main_image_url:
                  prod.product_media?.find((m: any) => m.is_primary)?.url ||
                  prod.product_media?.[0]?.url ||
                  null,
              }
            : undefined,
          variant: item.variant
            ? {
                ...item.variant,
                price: item.variant.price_override ?? prod?.base_price ?? 0,
                sale_price: item.variant.sale_price ?? null,
              }
            : undefined,
        };
      });
    }

    return data as Cart;
  }

  /**
   * Fetch cart specifically by its unique ID
   */
  static async getCartById(cartId: string): Promise<Cart | null> {
    return await this.getCart(null, null, cartId);
  }

  /**
   * Create a new cart
   */
  static async createCart(
    userId?: string | null,
    sessionId?: string | null
  ): Promise<Cart> {
    const supabase = await createAdminClient();

    const payload: any = {};
    if (userId) payload.user_id = userId;
    if (sessionId) payload.session_id = sessionId;

    const { data, error } = await supabase
      .from("carts")
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Failed to create cart: ${error.message}`);
    }

    return { ...data, items: [] } as Cart;
  }

  /**
   * Merge guest cart into user cart.
   * Backed by PostgreSQL RPC `merge_guest_cart` with an authoritative TypeScript fallback.
   * Completely idempotent: repeated calls with the same sessionId are safe no-ops.
   */
  static async mergeCart(sessionId: string, userId: string): Promise<void> {
    if (!sessionId || !userId) return;

    const supabase = await createAdminClient();

    // 1. Attempt PostgreSQL RPC for atomic database-level merge
    try {
      const { data: rpcResult, error: rpcError } = await supabase.rpc(
        "merge_guest_cart",
        {
          p_session_id: sessionId,
          p_user_id: userId,
        }
      );

      if (!rpcError && rpcResult) {
        return; // RPC succeeded atomically
      }
    } catch {
      // Fall through to TypeScript fallback if RPC does not exist in the current environment
    }

    // 2. TypeScript Server-Side Fallback Implementation
    const guestCart = await this.getCart(null, sessionId);
    if (!guestCart || !guestCart.items || guestCart.items.length === 0) {
      // If empty guest cart exists, remove it
      if (guestCart?.id) {
        await supabase.from("carts").delete().eq("id", guestCart.id);
      }
      return;
    }

    // Check if user already has an existing cart
    let userCart = await this.getCart(userId);

    // Fast path: if user has no cart, directly reassign guest cart to user
    if (!userCart) {
      const { error: reassignErr } = await supabase
        .from("carts")
        .update({
          user_id: userId,
          session_id: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", guestCart.id);

      if (reassignErr) {
        throw new Error(`Failed to reassign guest cart: ${reassignErr.message}`);
      }
      // Clean up any other carts for this session
      await supabase.from("carts").delete().eq("session_id", sessionId);
      return;
    }

    // User already has a cart: merge guest items into user cart
    for (const item of guestCart.items) {
      if (!item.variant_id) continue;

      // Check variant status
      const { data: variantData } = await supabase
        .from("variants")
        .select("is_active")
        .eq("id", item.variant_id)
        .maybeSingle();

      if (variantData && !variantData.is_active) {
        continue; // Skip inactive variants
      }

      // Check available inventory
      const { data: inventoryLevels } = await supabase
        .from("inventory_levels")
        .select("quantity_available")
        .eq("variant_id", item.variant_id);

      let totalAvailable = 999;
      if (inventoryLevels && inventoryLevels.length > 0) {
        totalAvailable = inventoryLevels.reduce(
          (sum: number, lvl: any) => sum + (lvl.quantity_available || 0),
          0
        );
      }

      if (totalAvailable <= 0) {
        continue; // Out of stock, skip
      }

      // Check if user cart already has this variant
      const existingItem = userCart.items?.find(
        (i) => i.variant_id === item.variant_id
      );

      let targetQuantity = item.quantity;
      if (existingItem) {
        targetQuantity += existingItem.quantity;
      }

      // Cap at total available stock
      targetQuantity = Math.min(targetQuantity, totalAvailable);
      if (targetQuantity <= 0) continue;

      if (existingItem) {
        const { error: updateErr } = await supabase
          .from("cart_items")
          .update({
            quantity: targetQuantity,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingItem.id);

        if (updateErr) {
          throw new Error(`Failed to update cart item: ${updateErr.message}`);
        }
      } else {
        const { error: insertErr } = await supabase
          .from("cart_items")
          .insert({
            cart_id: userCart.id,
            variant_id: item.variant_id,
            quantity: targetQuantity,
          });

        if (insertErr) {
          throw new Error(`Failed to add cart item: ${insertErr.message}`);
        }
      }
    }

    // Touch user cart updated_at timestamp
    await supabase
      .from("carts")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", userCart.id);

    // Delete guest cart and remove session identifier
    await supabase.from("carts").delete().eq("id", guestCart.id);
    await supabase.from("carts").delete().eq("session_id", sessionId);
  }

  /**
   * Add item to cart
   */
  static async addItem(
    cartId: string,
    productId: string,
    variantId: string | null,
    quantity: number
  ): Promise<void> {
    const supabase = await createAdminClient();

    if (!variantId) {
      throw new Error("A valid variant ID is required to add an item to the cart.");
    }

    // Check if variant already exists in this cart
    const { data: existingItem, error: fetchError } = await supabase
      .from("cart_items")
      .select("id, quantity")
      .eq("cart_id", cartId)
      .eq("variant_id", variantId)
      .maybeSingle();

    if (fetchError) {
      throw new Error(`Failed to fetch cart item: ${fetchError.message}`);
    }

    if (existingItem) {
      // Update quantity
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: existingItem.quantity + quantity })
        .eq("id", existingItem.id);

      if (error) {
        throw new Error(`Failed to update cart item: ${error.message}`);
      }
    } else {
      // Insert new cart item
      const { error } = await supabase.from("cart_items").insert({
        cart_id: cartId,
        variant_id: variantId,
        quantity,
      });

      if (error) {
        throw new Error(`Failed to add cart item: ${error.message}`);
      }
    }
  }

  /**
   * Update item quantity
   */
  static async updateItemQuantity(
    itemId: string,
    quantity: number
  ): Promise<void> {
    const supabase = await createAdminClient();

    if (quantity <= 0) {
      await this.removeItem(itemId);
      return;
    }

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", itemId);

    if (error) throw new Error(`Failed to update quantity: ${error.message}`);
  }

  /**
   * Remove item from cart
   */
  static async removeItem(itemId: string): Promise<void> {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (error) throw new Error(`Failed to remove item: ${error.message}`);
  }

  /**
   * Clear cart
   */
  static async clearCart(cartId: string): Promise<void> {
    const supabase = await createAdminClient();
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("cart_id", cartId);

    if (error) throw new Error(`Failed to clear cart: ${error.message}`);
  }
}
