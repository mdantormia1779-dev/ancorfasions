'use server';

import { CartService } from '@/services/cart.service';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server-client';

// Generate a random session ID for guests
const generateSessionId = () => Math.random().toString(36).substring(2, 15);

async function getUserIdAndSession(): Promise<{ userId?: string; sessionId?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const cookieStore = await cookies();
  let sessionId = cookieStore.get('cart_session_id')?.value;
  
  if (!user && !sessionId) {
    sessionId = generateSessionId();
    cookieStore.set('cart_session_id', sessionId, {
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
  }

  return { 
    userId: user?.id, 
    sessionId 
  };
}

export async function fetchCartAction() {
  const { userId, sessionId } = await getUserIdAndSession();
  const cartService = new CartService();
  return await cartService.initializeCart(userId, sessionId);
}

export async function addToCartAction(cartId: string, productId: string, quantity: number, variantId?: string) {
  const cartService = new CartService();
  await cartService.addToCart(cartId, productId, quantity, variantId);
  revalidatePath('/cart');
}

export async function updateCartItemQuantityAction(itemId: string, quantity: number) {
  const cartService = new CartService();
  if (quantity === 0) {
    await cartService.removeFromCart(itemId);
  } else {
    await cartService.updateQuantity(itemId, quantity);
  }
  revalidatePath('/cart');
}

export async function removeFromCartAction(itemId: string) {
  const cartService = new CartService();
  await cartService.removeFromCart(itemId);
  revalidatePath('/cart');
}

export async function clearCartAction(cartId: string) {
  const cartService = new CartService();
  await cartService.clearCart(cartId);
  revalidatePath('/cart');
}
