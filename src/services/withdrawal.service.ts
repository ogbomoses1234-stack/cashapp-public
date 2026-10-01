import { get, post } from './api';

type Loose = Record<string, unknown>;

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

export interface WithdrawalRequestPayload {
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export interface WithdrawalRow {
  id: string;
  amount: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'approved' | 'declined';
  declineReason: string | null;
  createdAt: string;
}

function normalizeWithdrawal(raw: Loose, index = 0): WithdrawalRow {
  const rawStatus = str(raw.status ?? 'pending').toLowerCase() as WithdrawalRow['status'];
  return {
    id: str(raw.id ?? raw._id ?? `wd-${index}`),
    amount: str(raw.amount ?? 0),
    bankCode: str(raw.bankCode ?? raw.bank_code ?? ''),
    accountNumber: str(raw.accountNumber ?? raw.account_number ?? ''),
    accountName: str(raw.accountName ?? raw.account_name ?? ''),
    status: rawStatus,
    declineReason: (raw.declineReason ?? raw.decline_reason ?? null) as string | null,
    createdAt: str(raw.createdAt ?? raw.created_at ?? new Date().toISOString()),
  };
}

export async function requestWithdrawal(
  input: WithdrawalRequestPayload
): Promise<WithdrawalRow> {
  const data = await post<Loose>('/api/public/withdrawals', {
    amount: num(input.amount),
    bankCode: input.bankCode,
    accountNumber: input.accountNumber.replace(/\D/g, '').slice(0, 10),
    accountName: input.accountName,
  });
  return normalizeWithdrawal((data ?? {}) as Loose);
}

export async function listWithdrawals(): Promise<WithdrawalRow[]> {
  const data = await get<unknown>('/api/public/withdrawals');

  const raw = Array.isArray(data)
    ? (data as Loose[])
    : (((data as Loose)?.items ?? []) as Loose[]);

  return raw.map((r, i) => normalizeWithdrawal(r, i));
}
