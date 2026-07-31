'use server';

import { CartService } from '../services/cart.service';
import { createClient } from '../supabase/server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

async function getSessionIdentifiers() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const cookieStore = await cookies();
  let guestSessionId = cookieStore.get('af_guest_session')?.value;
  
  if (!user && !guestSessionId) {
    guestSessionId = crypto.randomUUID();
    cookieStore.set('af_guest_session', guestSessionId, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30 // 30 days
    });
  }

  return {
    userId: user?.id || null,
    sessionId: user ? null : guestSessionId
  };
}

export async function fetchCartAction() {
  try {
    const { userId, sessionId } = await getSessionIdentifiers();
    const cart = await CartService.getOrCreateCart(userId, sessionId);
    return { success: true, cart };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addToCartAction(productId: string, variantId: string | null, quantity: number) {
  try {
    const { userId, sessionId } = await getSessionIdentifiers();
    await CartService.addItem(userId, sessionId, productId, variantId, quantity);
    revalidatePath('/cart');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCartItemQuantityAction(itemId: string, quantity: number) {
  try {
    await CartService.updateQuantity(itemId, quantity);
    revalidatePath('/cart');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function removeFromCartAction(itemId: string) {
  try {
    await CartService.removeItem(itemId);
    revalidatePath('/cart');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function clearCartAction(cartId: string) {
  try {
    await CartService.clearCart(cartId);
    revalidatePath('/cart');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function mergeGuestCartAction() {
  const supabase = await createClient();
    try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { success: false, error: 'User not logged in' };
    
    const cookieStore = await cookies();
    const guestSessionId = cookieStore.get('af_guest_session')?.value;
    
    if (guestSessionId) {
      await CartService.mergeGuestCart(guestSessionId, user.id);
      cookieStore.delete('af_guest_session');
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
