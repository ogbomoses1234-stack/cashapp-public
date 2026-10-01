import { create } from 'zustand';
import type { CartItem } from '@/types';
import * as cartService from '@/services/cart.service';
import { ApiClientError } from '@/services/api';

interface CartState {
  items: CartItem[];
  loading: boolean;
  mutating: boolean;
  error: string | null;
  lastAddedId: string | null;   // for UI "added!" flash

  /* Derived */
  count: () => number;
  subtotal: () => number;
  hasProduct: (productId: string) => boolean;

  /* Actions */
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clear: () => Promise<void>;
  reset: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  loading: false,
  mutating: false,
  error: null,
  lastAddedId: null,

  count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

  subtotal: () =>
    get().items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0),

  hasProduct: (productId) => get().items.some((i) => i.productId === productId),

  fetchCart: async () => {
    set({ loading: true, error: null });
    try {
      const items = await cartService.getCart();
      set({ items, loading: false });
    } catch (e) {
      set({
        loading: false,
        error: e instanceof ApiClientError ? e.message : 'Could not load cart',
      });
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ mutating: true, error: null });
    try {
      const items = await cartService.addToCart({ productId, quantity });
      set({ items, mutating: false, lastAddedId: productId });
      setTimeout(() => set({ lastAddedId: null }), 2000);
    } catch (e) {
      set({
        mutating: false,
        error: e instanceof ApiClientError ? e.message : 'Could not add item',
      });
      throw e;
    }
  },

  updateItem: async (cartItemId, quantity) => {
    set({ mutating: true, error: null });
    try {
      const items = await cartService.updateCartItem(cartItemId, quantity);
      set({ items, mutating: false });
    } catch (e) {
      set({
        mutating: false,
        error: e instanceof ApiClientError ? e.message : 'Could not update quantity',
      });
      throw e;
    }
  },

  removeItem: async (cartItemId) => {
    set({ mutating: true, error: null });
    try {
      const items = await cartService.removeCartItem(cartItemId);
      set({ items, mutating: false });
    } catch (e) {
      set({
        mutating: false,
        error: e instanceof ApiClientError ? e.message : 'Could not remove item',
      });
      throw e;
    }
  },

  clear: async () => {
    set({ mutating: true, error: null });
    try {
      await cartService.clearCart();
      set({ items: [], mutating: false });
    } catch (e) {
      set({
        mutating: false,
        error: e instanceof ApiClientError ? e.message : 'Could not clear cart',
      });
    }
  },

  reset: () => set({ items: [], loading: false, mutating: false, error: null }),
}));
