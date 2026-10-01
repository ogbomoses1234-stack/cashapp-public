import { post } from './api';

type Loose = Record<string, unknown>;

function num(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && isFinite(v)) return v;
  if (typeof v === 'string') {
    const n = parseFloat(v);
    if (isFinite(n)) return n;
  }
  return fallback;
}

function str(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return fallback;
}

/* ═══════════════════════════════════════════════════════════
   Redeem — customer scans QR to claim ₦100
═══════════════════════════════════════════════════════════ */
export interface RedeemResult {
  /** Amount credited, as a string, e.g. "100.00" */
  credited: string;
  /** New wallet balance after credit */
  newBalance: string;
  /** The serial that was redeemed */
  serialNumber: string;
}

export async function redeemScan(input: {
  serialNumber: string;
  sig?: string;
}): Promise<RedeemResult> {
  const raw = await post<Loose>('/api/public/scan/redeem', input);

  /* Backend may return any of these keys — normalize them all.
     We've seen: { amount }, { credited }, { reward }, { newBalance },
     { balance }, { walletBalance }, and nested { transaction, wallet }. */
  const data = (raw ?? {}) as Loose;
  const txn = (data.transaction ?? {}) as Loose;
  const wallet = (data.wallet ?? {}) as Loose;

  const amount =
    data.credited ??
    data.amount ??
    data.reward ??
    data.cashback ??
    data.value ??
    txn.amount ??
    100;

  const balance =
    data.newBalance ??
    data.new_balance ??
    data.balance ??
    data.walletBalance ??
    data.wallet_balance ??
    wallet.balance ??
    wallet.walletBalance ??
    amount;

  const serial =
    data.serialNumber ??
    data.serial_number ??
    data.serial ??
    input.serialNumber;

  return {
    credited: num(amount, 100).toFixed(2),
    newBalance: num(balance).toFixed(2),
    serialNumber: str(serial, input.serialNumber),
  };
}

/* ═══════════════════════════════════════════════════════════
   Dispatch — staff scans QR to mark item as taken for sale
═══════════════════════════════════════════════════════════ */
export interface DispatchResult {
  serialNumber: string;
  status: string;
  dispatchedAt: string;
}

export async function dispatchSerial(input: {
  serialNumber: string;
  sig?: string;
}): Promise<DispatchResult> {
  const raw = await post<Loose>('/api/public/scan/staff/dispatch', input);
  const data = (raw ?? {}) as Loose;

  return {
    serialNumber: str(data.serialNumber ?? data.serial_number ?? input.serialNumber),
    status: str(data.status, 'Dispatched'),
    dispatchedAt: str(data.dispatchedAt ?? data.dispatched_at ?? new Date().toISOString()),
  };
}
