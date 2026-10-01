import { get, getWithMeta } from './api';
import type { Product } from '@/types';

export interface ListProductsParams {
  search?: string;
  category?: string;
  featured?: boolean;
  sort?: 'newest' | 'price_asc' | 'price_desc';
  page?: number;
  perPage?: number;
}

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface ProductPage {
  items: Product[];
  meta: PaginationMeta;
}

/* ─── Flat list (used by most pages) ─────────────────────── */
export async function listProducts(params: ListProductsParams = {}): Promise<Product[]> {
  const { data } = await getWithMeta<Product[] | null, PaginationMeta>(
    '/api/public/products',
    params as Record<string, unknown>
  );
  return Array.isArray(data) ? data : [];
}

/* ─── Paginated list (returns items + meta) ─────────────── */
export async function listProductsPaged(
  params: ListProductsParams = {}
): Promise<ProductPage> {
  const { data, meta } = await getWithMeta<Product[] | null, PaginationMeta>(
    '/api/public/products',
    params as Record<string, unknown>
  );
  const items = Array.isArray(data) ? data : [];
  return {
    items,
    meta: meta ?? {
      page: params.page ?? 1,
      perPage: params.perPage ?? 24,
      total: items.length,
      totalPages: 1,
    },
  };
}

/* ─── Single product ─────────────────────────────────────── */
export function getProduct(slug: string) {
  return get<Product>(`/api/public/products/${slug}`);
}
