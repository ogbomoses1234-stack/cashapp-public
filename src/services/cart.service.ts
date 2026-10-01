import { del, get, patch, post } from './api';
import type { CartItem } from '@/types';

/* Backend responses can come as a bare array or { items: [...] }.
   We normalize here so the rest of the app has one shape to trust. */

type LooseCartItem = Record<string, unknown>;

function normalizeCartItem(raw: LooseCartItem): CartItem {
  const product = (raw.product ?? raw.Product ?? {}) as Record<string, unknown>;
  return {
    id: String(raw.id ?? raw._id ?? ''),
    productId: String(raw.productId ?? raw.product_id ?? product.id ?? ''),
    quantity: Number(raw.quantity ?? 1),
    product: {
      id: String(product.id ?? ''),
      title: String(product.title ?? product.name ?? '—'),
      slug: String(product.slug ?? product.id ?? ''),
      description: (product.description as string) ?? null,
      price: String(product.price ?? '0'),
      thumbnailUrl: (product.thumbnailUrl ?? product.thumbnail_url ?? null) as string | null,
      category: (product.category as string) ?? null,
      stockCount: Number(product.stockCount ?? product.stock_count ?? 0),
      isActive: Boolean(product.isActive ?? product.is_active ?? true),
      createdAt: String(product.createdAt ?? product.created_at ?? ''),
      updatedAt: String(product.updatedAt ?? product.updated_at ?? ''),
    },
  };
}

function extractItems(data: unknown): CartItem[] {
  if (!data) return [];
  if (Array.isArray(data)) return (data as LooseCartItem[]).map(normalizeCartItem);
  const obj = data as Record<string, unknown>;
  const arr = (obj.items ?? obj.cart ?? obj.data) as unknown;
  if (Array.isArray(arr)) return (arr as LooseCartItem[]).map(normalizeCartItem);
  return [];
}

export async function getCart(): Promise<CartItem[]> {
  const data = await get<unknown>('/api/public/cart');
  return extractItems(data);
}

export async function addToCart(input: { productId: string; quantity: number }): Promise<CartItem[]> {
  await post<unknown>('/api/public/cart/items', input);
  return getCart();
}

export async function updateCartItem(id: string, quantity: number): Promise<CartItem[]> {
  await patch<unknown>(`/api/public/cart/items/${id}`, { quantity });
  return getCart();
}

export async function removeCartItem(id: string): Promise<CartItem[]> {
  await del<unknown>(`/api/public/cart/items/${id}`);
  return getCart();
}

export async function clearCart(): Promise<void> {
  await del<unknown>('/api/public/cart');
}
