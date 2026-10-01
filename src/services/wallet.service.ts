import { get } from './api';
import type { Transaction, TransactionType, WalletSummary } from '@/types';

/**
 * Backend field names can vary by version. We normalize here once,
 * so every page can rely on a single canonical shape.
 */
type LooseWallet = Record<string, unknown>;
type LooseTxn = Record<string, unknown>;

function pickString(obj: LooseWallet, keys: string[], fallback = '0.00'): string {
  for (const k of keys) {
    const v = obj[k];
    if (v === null || v === undefined) continue;
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return v.toFixed(2);
  }
  return fallback;
}

function pickArray(obj: LooseWallet, keys: string[]): LooseTxn[] {
  for (const k of keys) {
    const v = obj[k];
    if (Array.isArray(v)) return v as LooseTxn[];
  }
  return [];
}

function normalizeTxn(raw: LooseTxn): Transaction {
  const type = (raw.type as TransactionType) ?? 'cashback_credit';
  const amountRaw = raw.amount ?? raw.value ?? 0;
  const amount =
    typeof amountRaw === 'string'
      ? amountRaw
      : typeof amountRaw === 'number'
        ? amountRaw.toFixed(2)
        : '0.00';

  return {
    id: String(raw.id ?? raw._id ?? crypto.randomUUID()),
    type,
    amount,
    reference: String(raw.reference ?? raw.serialNumber ?? raw.serial ?? '—'),
    createdAt: String(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
  };
}

/**
 * Normalize any plausible wallet payload into WalletSummary.
 * Handles camelCase, snake_case, and alternate names.
 */
export function normalizeWallet(input: unknown): WalletSummary {
  const raw = (input ?? {}) as LooseWallet;

  return {
    walletBalance: pickString(raw, [
      'walletBalance',
      'wallet_balance',
      'availableBalance',
      'available_balance',
      'balance',
    ]),
    pendingBalance: pickString(raw, [
      'pendingBalance',
      'pending_balance',
      'pending',
    ]),
    totalEarned: pickString(raw, [
      'totalEarned',
      'total_earned',
      'lifetimeRewards',
      'lifetime_rewards',
      'lifetime',
      'total',
    ]),
    recentTransactions: pickArray(raw, [
      'recentTransactions',
      'recent_transactions',
      'transactions',
      'recent',
      'activity',
      'history',
    ]).map(normalizeTxn),
  };
}

export async function getWallet(): Promise<WalletSummary> {
  const data = await get<unknown>('/api/public/wallet');
  return normalizeWallet(data);
}

export async function listTransactions(): Promise<Transaction[]> {
  const data = await get<unknown>('/api/public/wallet/transactions');
  // Backend might return a bare array, or { transactions: [...] } / { items: [...] }
  if (Array.isArray(data)) return (data as LooseTxn[]).map(normalizeTxn);
  const wrapped = normalizeWallet(data);
  return wrapped.recentTransactions;
}
