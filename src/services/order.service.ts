import { get, post } from './api';
import type { Order, PaymentMethod } from '@/types';

type Loose = Record<string, unknown>;

/* ─── Coercion helpers ──────────────────────────────────── */
function str(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return fallback;
}

function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    if (isFinite(n)) return n;
  }
  return fallback;
}

/* ─── Normalize one order ───────────────────────────────── */
function normalizeOrder(input: unknown, index = 0): Order | null {
  const r = (input ?? {}) as Loose;
  const raw = (r.order ?? r) as Loose;
  if (!raw || Object.keys(raw).length === 0) return null;

  const rawItems = (raw.items ?? raw.orderItems ?? raw.order_items ?? []) as unknown;

  const items = Array.isArray(rawItems)
    ? rawItems.map((it, i) => {
        const row = (it ?? {}) as Loose;
        const product = (row.product ?? {}) as Loose;
        return {
          id: str(row.id ?? row._id ?? `item-${i}`),
          productId: str(row.productId ?? row.product_id ?? product.id ?? ''),
          quantity: num(row.quantity, 1),
          unitPrice: str(
            row.unitPrice ?? row.unit_price ?? row.price ?? product.price ?? 0
          ),
          product: {
            id: str(product.id ?? row.productId ?? row.product_id ?? ''),
            title: str(
              product.title ?? row.productTitle ?? row.product_title ?? 'Item'
            ),
            slug: str(product.slug ?? product.id ?? ''),
            description: (product.description as string) ?? null,
            price: str(product.price ?? row.unitPrice ?? row.unit_price ?? 0),
            thumbnailUrl: (product.thumbnailUrl ??
              product.thumbnail_url ??
              null) as string | null,
            category: (product.category as string) ?? null,
            stockCount: num(product.stockCount ?? product.stock_count ?? 0),
            isActive: true,
            createdAt: str(
              product.createdAt ?? product.created_at ?? new Date().toISOString()
            ),
            updatedAt: str(
              product.updatedAt ?? product.updated_at ?? new Date().toISOString()
            ),
          },
        };
      })
    : [];

  return {
    id: str(raw.id ?? raw._id ?? `order-${index}`),
    orderNumber: str(raw.orderNumber ?? raw.order_number ?? raw.reference ?? '—'),
    totalAmount: str(raw.totalAmount ?? raw.total_amount ?? raw.total ?? 0),
    status: ((raw.status as Order['status']) ?? 'Processing') as Order['status'],
    paymentMethod: ((raw.paymentMethod ??
      raw.payment_method ??
      'bank_transfer') as PaymentMethod),
    receiptObjectKey: (raw.receiptObjectKey ??
      raw.receipt_object_key ??
      null) as string | null,
    deliveryAddress: str(raw.deliveryAddress ?? raw.delivery_address ?? '—'),
    createdAt: str(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
    updatedAt: str(raw.updatedAt ?? raw.updated_at ?? new Date().toISOString()),
    items,
    flagReason: (raw.flagReason ?? raw.flag_reason ?? null) as string | null,
    flaggedAt: (raw.flaggedAt ?? raw.flagged_at ?? null) as string | null,
  };
}

/* ─── Public API ────────────────────────────────────────── */

export interface PlaceOrderInput {
  items: { productId: string; quantity: number }[];
  paymentMethod: PaymentMethod;
  deliveryAddress: string;
  receiptObjectKey?: string;
}

export async function placeOrder(input: PlaceOrderInput): Promise<Order | null> {
  const data = await post<unknown>('/api/public/orders', input);
  return normalizeOrder(data);
}

export async function listOrders(): Promise<Order[]> {
  const data = await get<unknown>('/api/public/orders');
  const rawList = Array.isArray(data)
    ? (data as Loose[])
    : (((data as Loose)?.items ?? (data as Loose)?.orders ?? []) as Loose[]);
  return rawList
    .map((r, i) => normalizeOrder(r, i))
    .filter((o): o is Order => o !== null);
}

export async function getOrder(id: string): Promise<Order | null> {
  const data = await get<unknown>(`/api/public/orders/${id}`);
  return normalizeOrder(data);
}
