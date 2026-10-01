import { get, post } from './api';
import type { Bank } from '@/types';

type Loose = Record<string, unknown>;

/* ═══════════════════════════════════════════════════════════
   Account verification error
═══════════════════════════════════════════════════════════ */
export class AccountVerifyError extends Error {
  code:
    | 'INVALID_ACCOUNT'
    | 'BANK_CODE_MISMATCH'
    | 'PROVIDER_ERROR'
    | 'TIMEOUT'
    | 'UNKNOWN';
  status?: number;

  constructor(
    code: AccountVerifyError['code'],
    message: string,
    status?: number
  ) {
    super(message);
    this.name = 'AccountVerifyError';
    this.code = code;
    this.status = status;
  }
}

/* ═══════════════════════════════════════════════════════════
   Coercion helpers
═══════════════════════════════════════════════════════════ */
function str(v: unknown, fallback = ''): string {
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  return fallback;
}

function pickString(obj: Loose, keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (v === undefined || v === null) continue;
    const s = str(v, '');
    if (s) return s;
  }
  return '';
}

/* ═══════════════════════════════════════════════════════════
   Banks — dedupe + normalize
═══════════════════════════════════════════════════════════ */
export async function listBanks(): Promise<Bank[]> {
  const data = await get<unknown>('/api/public/payout/banks');
  const raw = Array.isArray(data)
    ? (data as Loose[])
    : (((data as Loose)?.items ?? []) as Loose[]);

  const seen = new Set<string>();
  return raw
    .map((b) => ({
      code: pickString(b, ['code', 'bankCode', 'bank_code']),
      name: pickString(b, ['name', 'bankName', 'bank_name']),
    }))
    .filter((b) => {
      if (!b.code || !b.name) return false;
      const key = `${b.code}::${b.name.toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

/* ═══════════════════════════════════════════════════════════
   Account verification
   Throws AccountVerifyError with a friendly code on failure
═══════════════════════════════════════════════════════════ */
export async function verifyAccount(input: {
  accountNumber: string;
  bankCode: string;
}): Promise<{ accountName: string }> {
  const acct = input.accountNumber.replace(/\D/g, '');

  /* Client-side pre-checks */
  if (acct.length !== 10) {
    throw new AccountVerifyError(
      'INVALID_ACCOUNT',
      'Account number must be exactly 10 digits'
    );
  }
  if (!input.bankCode) {
    throw new AccountVerifyError('INVALID_ACCOUNT', 'Select a bank first');
  }

  try {
    const res = await get<{ accountName?: string; name?: string }>(
      '/api/public/payout/verify',
      {
        accountNumber: acct,
        bankCode: input.bankCode,
      }
    );

    const accountName = res?.accountName ?? res?.name;
    if (!accountName) {
      throw new AccountVerifyError(
        'INVALID_ACCOUNT',
        'The bank returned no account name for this number'
      );
    }
    return { accountName };
  } catch (e) {
    /* Let AccountVerifyError bubble up as-is */
    if (e instanceof AccountVerifyError) throw e;

    const err = e as { status?: number; code?: string; message?: string };

    if (err.status === 400) {
      throw new AccountVerifyError(
        'BANK_CODE_MISMATCH',
        'This account number does not match the selected bank. Check both and try again.',
        400
      );
    }
    if (err.status === 404) {
      throw new AccountVerifyError(
        'INVALID_ACCOUNT',
        'No account found with those details.',
        404
      );
    }
    if (err.code === 'TIMEOUT') {
      throw new AccountVerifyError(
        'TIMEOUT',
        'Verification timed out. Check your connection and try again.'
      );
    }
    if (err.status && err.status >= 500) {
      throw new AccountVerifyError(
        'PROVIDER_ERROR',
        'The bank verification service is temporarily unavailable.',
        err.status
      );
    }
    throw new AccountVerifyError(
      'UNKNOWN',
      err.message ?? 'Could not verify this account'
    );
  }
}

/* ═══════════════════════════════════════════════════════════
   Save payout account
═══════════════════════════════════════════════════════════ */
export function savePayout(input: {
  bankCode: string;
  accountNumber: string;
  accountName: string;
}) {
  return post<unknown>('/api/public/payout', input);
}

/* ═══════════════════════════════════════════════════════════
   Saved payout getter
   Unwraps every plausible response shape and field name
═══════════════════════════════════════════════════════════ */
export interface SavedPayout {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export async function getSavedPayout(): Promise<SavedPayout | null> {
  /* ─── Try 1: dedicated payout endpoint ──────────────── */
  try {
    const data = await get<unknown>('/api/public/payout');
    const parsed = extractPayout(data);
    if (parsed) return parsed;
  } catch {}

  /* ─── Try 2: read from /auth/me ─────────────────────── */
  try {
    const me = await get<unknown>('/api/public/auth/me');
    const parsed = extractPayout(me);
    if (parsed) return parsed;
  } catch {}

  return null;
}

/* ═══════════════════════════════════════════════════════════
   extractPayout — checks every plausible shape
═══════════════════════════════════════════════════════════ */
function extractPayout(input: unknown): SavedPayout | null {
  if (!input || typeof input !== 'object') return null;

  const wrap = input as Loose;

  const candidates: Loose[] = [
    wrap,
    (wrap.data as Loose) ?? {},
    (wrap.payout as Loose) ?? {},
    (wrap.user as Loose) ?? {},
    (wrap.profile as Loose) ?? {},
  ];

  const data = wrap.data as Loose | undefined;
  if (data && typeof data === 'object') {
    candidates.push((data.payout as Loose) ?? {});
    candidates.push((data.user as Loose) ?? {});
    candidates.push((data.profile as Loose) ?? {});
  }

  for (const c of candidates) {
    if (!c || typeof c !== 'object') continue;

    const accountNumber = pickString(c, [
      'accountNumber',
      'account_number',
      'payoutAccountNumber',
      'payout_account_number',
      'bankAccountNumber',
      'bank_account_number',
      'bankAcctNumber',
      'bank_acct_number',
    ]);

    if (!accountNumber) continue;

    return {
      bankCode: pickString(c, [
        'bankCode',
        'bank_code',
        'bankId',
        'bank_id',
        'payoutBankCode',
        'payout_bank_code',
        'bank',
      ]),
      bankName: pickString(c, [
        'bankName',
        'bank_name',
        'bankLabel',
        'bank_label',
        'payoutBankName',
        'payout_bank_name',
      ]),
      accountNumber,
      accountName: pickString(c, [
        'accountName',
        'account_name',
        'payoutAccountName',
        'payout_account_name',
        'bankAccountName',
        'bank_account_name',
        'fullName',
        'full_name',
      ]),
    };
  }

  return null;
}
