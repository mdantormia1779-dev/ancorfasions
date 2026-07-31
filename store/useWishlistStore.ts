import { create } from "zustand";
import { Wishlist } from "@/types/checkout.types";
import {
  fetchWishlistAction,
  addToWishlistAction,
  removeFromWishlistAction,
  removeWishlistItemByProductIdAction,
  moveWishlistItemToCartAction,
} from "@/lib/actions/wishlist.actions";

interface WishlistState {
  wishlist: Wishlist | null;
  isLoading: boolean;
  error: string | null;

  fetchWishlist: () => Promise<void>;
  addItem: (productId: string, variantId?: string | null) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  removeItemByProductId: (productId: string) => Promise<void>;
  moveToCart: (
    itemId: string,
    productId: string,
    variantId?: string | null
  ) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  wishlist: null,
  isLoading: false,
  error: null,

  fetchWishlist: async () => {
    set({ isLoading: true, error: null });
    const res = await fetchWishlistAction();
    if (res.success) {
      set({ wishlist: res.wishlist, isLoading: false });
    } else {
      set({ error: res.error, isLoading: false });
    }
  },

  addItem: async (productId, variantId) => {
    set({ isLoading: true, error: null });
    const res = await addToWishlistAction(productId, variantId);
    if (res.success) {
      await get().fetchWishlist();
    } else {
      set({ error: res.error, isLoading: false });
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true, error: null });
    const res = await removeFromWishlistAction(itemId);
    if (res.success) {
      await get().fetchWishlist();
    } else {
      set({ error: res.error, isLoading: false });
    }
  },

  removeItemByProductId: async (productId) => {
    set({ isLoading: true, error: null });
    const res = await removeWishlistItemByProductIdAction(productId);
    if (res.success) {
      await get().fetchWishlist();
    } else {
      set({ error: res.error, isLoading: false });
    }
  },

  moveToCart: async (itemId, productId, variantId) => {
    set({ isLoading: true, error: null });
    const res = await moveWishlistItemToCartAction(
      itemId,
      productId,
      variantId
    );
    if (res.success) {
      await get().fetchWishlist();
      // Should ideally trigger cart store update here, but we will let the cart component re-fetch or use a global event/hook.
    } else {
      set({ error: res.error, isLoading: false });
    }
  },
}));
