import { get, post } from './api';

/* ═══════════════════════════════════════════════════════════
   Types
═══════════════════════════════════════════════════════════ */
export interface StaffStockItem {
  serialNumber: string;
  productId: string | null;
  productTitle: string;
  status: 'Dispatched' | 'Redeemed';
  dispatchedAt: string;
  redeemedAt: string | null;
  timeToRedeemSeconds: number | null;
}

export interface StaffStockStats {
  takenToday: number;
  sold: number;
  awaitingSale: number;
  takenTotal: number;
  soldTotal: number;
  items: StaffStockItem[];
}

type Loose = Record<string, unknown>;

/* ═══════════════════════════════════════════════════════════
   Coercion helpers
═══════════════════════════════════════════════════════════ */
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

/* ═══════════════════════════════════════════════════════════
   Normalize one stock item
═══════════════════════════════════════════════════════════ */
function normalizeStockItem(input: unknown, index = 0): StaffStockItem {
  const r = (input ?? {}) as Loose;
  const product = (r.product ?? {}) as Loose;

  const dispatchedAt = str(
    r.dispatchedAt ?? r.dispatched_at ?? new Date().toISOString()
  );
  const redeemedAt = (r.redeemedAt ?? r.redeemed_at ?? null) as string | null;

  /* Compute time to redeem if not provided */
  let timeToRedeem: number | null =
    typeof r.timeToRedeemSeconds === 'number'
      ? (r.timeToRedeemSeconds as number)
      : null;

  if (timeToRedeem === null && redeemedAt && dispatchedAt) {
    const diff =
      new Date(redeemedAt).getTime() - new Date(dispatchedAt).getTime();
    if (isFinite(diff) && diff >= 0) timeToRedeem = Math.round(diff / 1000);
  }

  return {
    serialNumber: str(
      r.serialNumber ?? r.serial_number ?? r.serial ?? `item-${index}`
    ),
    productId: (r.productId ?? r.product_id ?? product.id ?? null) as
      | string
      | null,
    productTitle: str(
      r.productTitle ?? r.product_title ?? product.title ?? 'Item'
    ),
    status: (r.status === 'Redeemed' ? 'Redeemed' : 'Dispatched') as
      | 'Dispatched'
      | 'Redeemed',
    dispatchedAt,
    redeemedAt,
    timeToRedeemSeconds: timeToRedeem,
  };
}

/* ═══════════════════════════════════════════════════════════
   Normalize the full staff stats payload
═══════════════════════════════════════════════════════════ */
function normalizeStats(input: unknown): StaffStockStats {
  const r = (input ?? {}) as Loose;

  const rawItems = (r.items ?? r.serials ?? r.stock ?? []) as unknown;
  const items = Array.isArray(rawItems)
    ? (rawItems as Loose[]).map((x, i) => normalizeStockItem(x, i))
    : [];

  /* Derive counts if backend didn't provide them */
  const derivedTaken = items.filter((i) => i.status === 'Dispatched').length;
  const derivedSold = items.filter((i) => i.status === 'Redeemed').length;

  return {
    takenToday: num(r.takenToday ?? r.taken_today ?? derivedTaken),
    sold: num(r.sold ?? r.soldToday ?? r.sold_today ?? derivedSold),
    awaitingSale: num(
      r.awaitingSale ?? r.awaiting_sale ?? derivedTaken
    ),
    takenTotal: num(r.takenTotal ?? r.taken_total ?? items.length),
    soldTotal: num(r.soldTotal ?? r.sold_total ?? derivedSold),
    items,
  };
}

/* ═══════════════════════════════════════════════════════════
   Public API
═══════════════════════════════════════════════════════════ */

export function changeStaffPassword(input: {
  oldPassword: string;
  newPassword: string;
}) {
  return post<{ updated: true }>('/api/public/staff/change-password', input);
}

export async function getMyStock(): Promise<StaffStockStats> {
  const data = await get<unknown>('/api/public/staff/my-stock');
  return normalizeStats(data);
}
