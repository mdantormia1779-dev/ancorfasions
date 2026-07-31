import { CartRepository } from "@/repositories/cart.repository";
import { Cart, CartItem } from "@/types/checkout.types";

export class CartService {
  private cartRepository: CartRepository;

  constructor() {
    this.cartRepository = new CartRepository();
  }

  async getCart(cartId: string): Promise<Cart | null> {
    return await this.cartRepository.getCartById(cartId);
  }

  async getCartByUser(userId: string): Promise<Cart | null> {
    return await this.cartRepository.getCartByUserId(userId);
  }

  async initializeCart(userId?: string, sessionId?: string): Promise<Cart> {
    if (userId) {
      const existing = await this.cartRepository.getCartByUserId(userId);
      if (existing) return existing;
    }
    return await this.cartRepository.createCart(userId, sessionId);
  }

  async addToCart(
    cartId: string,
    productId: string,
    quantity: number,
    variantId?: string
  ): Promise<CartItem> {
    if (quantity <= 0) throw new Error("Quantity must be greater than zero");

    // In a real scenario, we'd also check inventory using a ProductService here before adding.
    // Assuming validation is handled or stock is sufficient for now.

    return await this.cartRepository.addItem(
      cartId,
      productId,
      quantity,
      variantId
    );
  }

  async updateQuantity(itemId: string, quantity: number): Promise<CartItem> {
    if (quantity <= 0) throw new Error("Quantity must be greater than zero");
    return await this.cartRepository.updateItemQuantity(itemId, quantity);
  }

  async removeFromCart(itemId: string): Promise<void> {
    await this.cartRepository.removeItem(itemId);
  }

  async clearCart(cartId: string): Promise<void> {
    await this.cartRepository.clearCart(cartId);
  }

  async mergeGuestCart(guestCartId: string, userId: string): Promise<void> {
    await this.cartRepository.mergeCart(guestCartId, userId);
  }
}
