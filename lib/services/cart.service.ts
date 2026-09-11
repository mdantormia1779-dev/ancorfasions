import { CartRepository } from "../repositories/cart.repository";
import { Cart } from "@/types/checkout.types";
import { createAdminClient } from "@/lib/supabase/server";
import { FlashSaleService } from "@/lib/services/marketing/flash-sale.service";

export class CartService {
  /**
   * Get or create a cart
   */
  static async getOrCreateCart(
    userId?: string | null,
    sessionId?: string | null,
    cartId?: string | null
  ): Promise<Cart> {
    if (!userId && !sessionId && !cartId) {
      throw new Error("Must provide userId, sessionId, or cartId");
    }

    let cart = await CartRepository.getCart(userId, sessionId, cartId);

    if (!cart) {
      cart = await CartRepository.createCart(userId, sessionId);
    }

    return cart;
  }

  /**
   * Add an item to the cart with authoritative server-side validation:
   * - Product exists & is ACTIVE
   * - Variant belongs to product & is ACTIVE (or ensures default variant for simple products)
   * - Quantity is positive integer
   * - Authoritative inventory levels are respected
   * - Flash sale availability is verified
   */
  static async addItem(
    userId: string | null | undefined,
    sessionId: string | null | undefined,
    productId: string,
    variantId: string | null,
    quantity: number
  ): Promise<void> {
    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error("Quantity must be at least 1.");
    }

    const supabase = await createAdminClient();

    // 1. Verify Product exists and is active
    const { data: product, error: productErr } = await supabase
      .from("products")
      .select("id, name, slug, status, sku, base_price")
      .eq("id", productId)
      .single();

    if (productErr || !product || product.status !== "ACTIVE") {
      throw new Error("This product is currently unavailable for purchase.");
    }

    // 2. Verify or resolve variant
    const { data: variants, error: variantsErr } = await supabase
      .from("variants")
      .select("id, sku, is_active, price_override, sale_price")
      .eq("product_id", productId);

    if (variantsErr) {
      throw new Error(`Failed to verify product options: ${variantsErr.message}`);
    }

    let effectiveVariantId: string;

    if (variants && variants.length > 0) {
      if (!variantId) {
        throw new Error("Please select a variant option before adding to cart.");
      }
      const matchedVariant = variants.find((v) => v.id === variantId);
      if (!matchedVariant) {
        throw new Error("Selected variant does not belong to this product.");
      }
      if (!matchedVariant.is_active) {
        throw new Error("Selected variant is currently inactive.");
      }
      effectiveVariantId = matchedVariant.id;
    } else {
      // Product has no variants in DB. Check or create a default variant
      let { data: defaultVariant } = await supabase
        .from("variants")
        .select("id, is_active")
        .eq("product_id", productId)
        .maybeSingle();

      if (!defaultVariant) {
        const defaultSku =
          product.sku ||
          `${product.slug.toUpperCase().slice(0, 10)}-DEFAULT-${Date.now().toString().slice(-4)}`;
        const { data: createdVariant, error: createVariantErr } = await supabase
          .from("variants")
          .insert({
            product_id: product.id,
            sku: defaultSku,
            price_override: product.base_price,
            is_active: true,
            attributes: {},
          })
          .select("id, is_active")
          .single();

        if (createVariantErr || !createdVariant) {
          throw new Error("Could not initialize product variant.");
        }
        defaultVariant = createdVariant;
      }
      effectiveVariantId = defaultVariant.id;
    }

    // 3. Check inventory stock from inventory_levels
    const { data: inventoryLevels } = await supabase
      .from("inventory_levels")
      .select("quantity_available")
      .eq("variant_id", effectiveVariantId);

    if (inventoryLevels && inventoryLevels.length > 0) {
      const totalAvailable = inventoryLevels.reduce(
        (sum: number, lvl: any) => sum + (lvl.quantity_available || 0),
        0
      );

      if (totalAvailable <= 0) {
        throw new Error("This item is currently out of stock.");
      }

      // Check existing quantity in current cart
      const cart = await this.getOrCreateCart(userId, sessionId);
      const existingItem = (cart.items || []).find(
        (i: any) => i.variant_id === effectiveVariantId
      );
      const currentInCart = existingItem ? existingItem.quantity : 0;

      if (currentInCart + quantity > totalAvailable) {
        const remaining = Math.max(0, totalAvailable - currentInCart);
        if (remaining <= 0) {
          throw new Error(
            `You already have the maximum available stock (${totalAvailable}) in your cart.`
          );
        }
        throw new Error(
          `Cannot add ${quantity} item(s). Only ${remaining} more available in stock.`
        );
      }
    }

    // 4. Check active flash sale availability if applicable
    const flashSale = await FlashSaleService.getFlashSaleForProduct(productId);
    if (flashSale) {
      const flashRemaining = Math.max(
        0,
        flashSale.stock_allocated - flashSale.stock_sold
      );
      if (flashRemaining <= 0) {
        throw new Error("Flash sale stock for this item is fully claimed.");
      }
      const cart = await this.getOrCreateCart(userId, sessionId);
      const existingItem = (cart.items || []).find(
        (i: any) => i.variant_id === effectiveVariantId
      );
      const currentInCart = existingItem ? existingItem.quantity : 0;
      if (currentInCart + quantity > flashRemaining) {
        throw new Error(
          `Only ${flashRemaining} item(s) remain at flash sale price.`
        );
      }
    }

    // 5. Add to cart
    const cart = await this.getOrCreateCart(userId, sessionId);
    await CartRepository.addItem(cart.id, productId, effectiveVariantId, quantity);
  }

  /**
   * Update quantity with authoritative inventory checks
   */
  static async updateQuantity(itemId: string, quantity: number): Promise<void> {
    if (quantity <= 0) {
      await this.removeItem(itemId);
      return;
    }

    const supabase = await createAdminClient();
    const { data: item } = await supabase
      .from("cart_items")
      .select("id, variant_id")
      .eq("id", itemId)
      .maybeSingle();

    if (item && item.variant_id) {
      const { data: inventoryLevels } = await supabase
        .from("inventory_levels")
        .select("quantity_available")
        .eq("variant_id", item.variant_id);

      if (inventoryLevels && inventoryLevels.length > 0) {
        const totalAvailable = inventoryLevels.reduce(
          (sum: number, lvl: any) => sum + (lvl.quantity_available || 0),
          0
        );

        if (quantity > totalAvailable) {
          throw new Error(
            `Cannot set quantity to ${quantity}. Only ${totalAvailable} item(s) available.`
          );
        }
      }
    }

    await CartRepository.updateItemQuantity(itemId, quantity);
  }

  /**
   * Remove item with optional caller ownership validation
   */
  static async removeItem(
    itemId: string,
    userId?: string | null,
    sessionId?: string | null
  ): Promise<void> {
    if (userId !== undefined || sessionId !== undefined) {
      await this.verifyItemOwnership(itemId, userId || null, sessionId || null);
    }
    await CartRepository.removeItem(itemId);
  }

  /**
   * Clear cart with optional caller ownership validation
   */
  static async clearCart(
    cartId: string,
    userId?: string | null,
    sessionId?: string | null
  ): Promise<void> {
    if (userId || sessionId) {
      const cart = await CartRepository.getCart(userId, sessionId);
      if (!cart || cart.id !== cartId) {
        throw new Error("Unauthorized: cannot clear a cart that does not belong to you");
      }
    }
    await CartRepository.clearCart(cartId);
  }

  /**
   * Merge guest cart to user cart
   */
  static async mergeGuestCart(
    sessionId: string,
    userId: string
  ): Promise<void> {
    await CartRepository.mergeCart(sessionId, userId);
  }

  /**
   * Verify that a cart item belongs to the calling user's cart.
   * Throws if the item is not found or belongs to a different user.
   */
  static async verifyItemOwnership(
    itemId: string,
    userId: string | null,
    sessionId: string | null
  ): Promise<void> {
    const cart = await CartRepository.getCart(userId, sessionId);
    if (!cart) {
      throw new Error("Cart not found");
    }
    const itemBelongsToCart = cart.items?.some(
      (item: any) => item.id === itemId
    );
    if (!itemBelongsToCart) {
      throw new Error("Unauthorized: cart item does not belong to your cart");
    }
  }
}
