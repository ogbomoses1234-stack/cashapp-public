import { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { toast } from '@/hooks/useToast';
import { ApiClientError } from '@/services/api';

/**
 * Convenience hook — gives components everything they need for cart UX.
 * Auto-syncs cart on user change.
 */
export function useCart() {
  const user = useAuthStore((s) => s.user);
  const {
    items,
    loading,
    mutating,
    error,
    lastAddedId,
    count,
    subtotal,
    hasProduct,
    fetchCart,
    addItem,
    updateItem,
    removeItem,
    clear,
  } = useCartStore();

  useEffect(() => {
    if (user && user.role === 'customer') {
      fetchCart();
    }
  }, [user, fetchCart]);

  const add = async (productId: string, quantity = 1) => {
    try {
      await addItem(productId, quantity);
      toast.success('Added to cart');
    } catch (e) {
      toast.error((e as ApiClientError).message);
      throw e;
    }
  };

  const update = async (cartItemId: string, quantity: number) => {
    try {
      await updateItem(cartItemId, quantity);
    } catch (e) {
      toast.error((e as ApiClientError).message);
    }
  };

  const remove = async (cartItemId: string) => {
    try {
      await removeItem(cartItemId);
    } catch (e) {
      toast.error((e as ApiClientError).message);
    }
  };

  return {
    items,
    loading,
    mutating,
    error,
    lastAddedId,
    count: count(),
    subtotal: subtotal(),
    hasProduct,
    refresh: fetchCart,
    add,
    update,
    remove,
    clear,
  };
}
