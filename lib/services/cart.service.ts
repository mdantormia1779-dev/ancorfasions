import { CartRepository } from "../repositories/cart.repository";
import { Cart } from "@/types/checkout.types";

export class CartService {
  /**
   * Get or create a cart
   */
  static async getOrCreateCart(
    userId?: string | null,
    sessionId?: string | null
  ): Promise<Cart> {
    if (!userId && !sessionId) {
      throw new Error("Must provide userId or sessionId");
    }

    let cart = await CartRepository.getCart(userId, sessionId);

    if (!cart) {
      cart = await CartRepository.createCart(userId, sessionId);
    }

    return cart;
  }

  /**
   * Add an item to the cart, checking inventory if necessary
   */
  static async addItem(
    userId: string | null | undefined,
    sessionId: string | null | undefined,
    productId: string,
    variantId: string | null,
    quantity: number
  ): Promise<void> {
    const cart = await this.getOrCreateCart(userId, sessionId);
    await CartRepository.addItem(cart.id, productId, variantId, quantity);
  }

  /**
   * Update quantity
   */
  static async updateQuantity(itemId: string, quantity: number): Promise<void> {
    await CartRepository.updateItemQuantity(itemId, quantity);
  }

  /**
   * Remove item
   */
  static async removeItem(itemId: string): Promise<void> {
    await CartRepository.removeItem(itemId);
  }

  /**
   * Clear cart
   */
  static async clearCart(cartId: string): Promise<void> {
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
}
