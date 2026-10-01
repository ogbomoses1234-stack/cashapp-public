import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWallet } from '@/services/wallet.service';
import {
  requestWithdrawal,
  listWithdrawals,
} from '@/services/withdrawal.service';
import { getSavedPayout, type SavedPayout } from '@/services/payout.service';
import type { WalletSummary, WithdrawalRequest } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { formatNaira, formatDate, maskAccountNumber } from '@/utils/format';
import { toast } from '@/hooks/useToast';
import { ApiClientError } from '@/services/api';

/* ═══════════════════════════════════════════════════════════
   Payout account type (loose — matches whatever backend stores)
═══════════════════════════════════════════════════════════ */
/* SavedPayout type comes from payout.service.ts */

/* ═══════════════════════════════════════════════════════════
   Page
═══════════════════════════════════════════════════════════ */
export default function WithdrawalPage() {
  const navigate = useNavigate();

  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [payout, setPayout] = useState<SavedPayout | null>(null);
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ─── Load wallet + payout + history ──────────────────── */
  useEffect(() => {
    let alive = true;

    Promise.allSettled([
      getWallet(),
      getSavedPayout(),
      listWithdrawals(),
    ]).then(([w, p, h]) => {
      if (!alive) return;

      if (w.status === 'fulfilled') setWallet(w.value);
      if (p.status === 'fulfilled') setPayout(p.value);
      if (h.status === 'fulfilled')
        setHistory(Array.isArray(h.value) ? h.value : []);

      setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, []);

  /* ─── Derived ─────────────────────────────────────────── */
  const balance = parseFloat(wallet?.walletBalance ?? '0');
  const parsedAmount = parseFloat(amount) || 0;
  const hasBalance = balance > 0;
  const hasPayout = !!payout && payout.accountNumber.length === 10;
  const meetsMinimum = parsedAmount >= 100;
  const meetsBalance = parsedAmount > 0 && parsedAmount <= balance;
  const canSubmit =
    hasBalance && hasPayout && meetsMinimum && meetsBalance && !submitting;

  /* ─── Submit ──────────────────────────────────────────── */
  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);

    try {
      await requestWithdrawal({
        amount: parsedAmount,
        bankCode: payout!.bankCode,
        accountNumber: payout!.accountNumber,
        accountName: payout!.accountName,
      });

      toast.success('Withdrawal requested — admin will review shortly');
      setAmount('');

      /* Reload history + wallet */
      const [updatedWallet, updatedHistory] = await Promise.all([
        getWallet().catch(() => wallet),
        listWithdrawals().catch(() => history),
      ]);
      if (updatedWallet) setWallet(updatedWallet);
      if (Array.isArray(updatedHistory)) setHistory(updatedHistory);
    } catch (e) {
      const err = e as ApiClientError;

      /* Map known error codes to friendly messages */
      if (err.code === 'WITHDRAWAL_MIN' || /minimum/i.test(err.message)) {
        setError('Minimum withdrawal is ₦100');
      } else if (
        err.code === 'WITHDRAWAL_INSUFFICIENT' ||
        /insufficient/i.test(err.message)
      ) {
        setError('You do not have enough balance for this withdrawal');
      } else if (err.code === 'VALIDATION_ERROR' || err.status === 400) {
        setError(
          'Some withdrawal details are missing. Please reconfigure your payout account.'
        );
      } else {
        setError(err.message || 'Could not submit withdrawal request');
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Loading ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-[26px] font-black tracking-[-0.03em]">Withdraw</h1>
        <div className="flex justify-center py-16">
          <Spinner size={28} className="!border-slate-300 !border-t-brand-500" />
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     NO PAYOUT ACCOUNT SET UP — block the flow
  ═══════════════════════════════════════════════════════ */
  if (!hasPayout) {
    return (
      <div className="space-y-5 pb-2">
        <div>
          <h1 className="text-[26px] font-black tracking-[-0.03em] text-ink-900">
            Withdraw
          </h1>
          <p className="mt-1 text-[12.5px] font-medium text-ink-400">
            Set up your payout account first
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/40 p-5 shadow-card">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-amber-500 text-white shadow-[0_6px_16px_-6px_rgba(245,158,11,.7)]">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4M12 17h.01" />
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </span>
            <div>
              <p className="text-[13.5px] font-black tracking-tight text-amber-900">
                No payout account
              </p>
              <p className="mt-0.5 text-[11.5px] font-semibold text-amber-800/80">
                We need your bank details before we can send funds
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-1.5">
            <Bullet>Add your bank and 10-digit account number</Bullet>
            <Bullet>We&apos;ll verify the account name instantly</Bullet>
            <Bullet>Then come back here to withdraw</Bullet>
          </div>

          <Button
            variant="primary"
            size="lg"
            block
            className="mt-5"
            onClick={() => navigate('/payout')}
          >
            Set up payout account
          </Button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════════════
     MAIN WITHDRAWAL VIEW
  ═══════════════════════════════════════════════════════ */
  return (
    <div className="space-y-5 pb-2">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-black tracking-[-0.03em] text-ink-900">
          Withdraw
        </h1>
        <p className="mt-1 text-[12.5px] font-medium text-ink-400">
          Transfer your cashback balance to your bank
        </p>
      </div>

      {/* ─── Balance card ────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F2A24] via-[#0C1F1B] to-[#0B0F14] p-5 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full opacity-70"
          style={{
            background:
              'radial-gradient(circle, rgba(52,211,153,.4), transparent 65%)',
          }}
        />
        <div className="relative">
          <p className="text-[10.5px] font-black uppercase tracking-[0.1em] text-white/45">
            Available balance
          </p>
          <p className="mt-2 text-[32px] font-black leading-none tracking-[-0.03em]">
            {formatNaira(balance)}
          </p>
        </div>
      </div>

      {/* ─── Payout account preview ──────────────────────── */}
      <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-ink-100/60">
        <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-700">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18" />
            <path d="M5 21V10l7-5 7 5v11" />
            <path d="M9 21v-6h6v6" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] font-black uppercase tracking-wider text-ink-400">
            Sending to
          </p>
          <p className="mt-0.5 truncate text-[13.5px] font-black tracking-tight text-ink-900">
            {payout!.bankName}
          </p>
          <p className="mt-0.5 truncate font-mono text-[11.5px] font-semibold text-ink-400">
            {maskAccountNumber(payout!.accountNumber)} ·{' '}
            {payout!.accountName}
          </p>
        </div>
        <Link
          to="/payout"
          className="flex-shrink-0 text-[11.5px] font-black text-brand-700 hover:text-brand-800"
        >
          Change
        </Link>
      </div>

      {/* ─── Amount input ────────────────────────────────── */}
      <div className="space-y-4 rounded-2xl bg-white p-5 shadow-card ring-1 ring-ink-100/60">
        <label className="block">
          <span className="mb-2 block text-[11px] font-black uppercase tracking-wider text-ink-500">
            Amount to withdraw
          </span>
          <div className="relative">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-black text-ink-400">
              ₦
            </span>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => {
                setError(null);
                setAmount(e.target.value.replace(/[^\d.]/g, ''));
              }}
              placeholder="0.00"
              disabled={submitting}
              className="w-full rounded-xl border-0 bg-ink-50/60 py-3.5 pl-9 pr-4 text-[15px] font-black tracking-tight text-ink-900 outline-none ring-1 ring-inset ring-ink-100/80 transition placeholder:font-semibold placeholder:text-ink-300 focus:bg-white focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
            />
          </div>

          {/* Quick amount chips */}
          {hasBalance && (
            <div className="mt-3 flex flex-wrap gap-2">
              {[1000, 2000, 5000].filter((v) => v <= balance).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(String(v))}
                  disabled={submitting}
                  className="rounded-lg bg-ink-50/70 px-3 py-1.5 text-[11.5px] font-black text-ink-700 ring-1 ring-inset ring-ink-100/80 transition hover:bg-ink-100 active:scale-95 disabled:opacity-50"
                >
                  ₦{v.toLocaleString()}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount(String(balance))}
                disabled={submitting}
                className="rounded-lg bg-brand-500/10 px-3 py-1.5 text-[11.5px] font-black text-brand-700 ring-1 ring-inset ring-brand-500/20 transition hover:bg-brand-500/20 active:scale-95 disabled:opacity-50"
              >
                Max
              </button>
            </div>
          )}

          {/* Inline validation hints */}
          {parsedAmount > 0 && !meetsMinimum && (
            <p className="mt-2 text-[11px] font-bold text-amber-600">
              Minimum withdrawal is ₦100
            </p>
          )}
          {parsedAmount > balance && (
            <p className="mt-2 text-[11px] font-bold text-rose-600">
              Amount exceeds your available balance
            </p>
          )}
        </label>

        {/* Error banner */}
        {error && (
          <div className="rounded-xl bg-rose-50 px-3.5 py-3 ring-1 ring-inset ring-rose-200">
            <p className="text-[12px] font-bold text-rose-700">{error}</p>
          </div>
        )}

        <Button
          variant="primary"
          size="lg"
          block
          onClick={handleSubmit}
          loading={submitting}
          disabled={!canSubmit}
        >
          Request withdrawal
        </Button>

        <p className="text-center text-[10.5px] font-medium text-ink-400">
          Payouts typically arrive within 1–2 business days
        </p>
      </div>

      {/* ─── History ─────────────────────────────────────── */}
      {history.length > 0 && (
        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-[15px] font-extrabold tracking-tight text-ink-900">
              Recent requests
            </h2>
            <span className="text-[11px] font-bold text-ink-400">
              {history.length} total
            </span>
          </div>

          <div className="space-y-2.5">
            {history.slice(0, 10).map((w) => (
              <WithdrawalRow key={w.id} withdrawal={w} />
            ))}
          </div>
        </section>
      )}

      {/* ─── Empty history ───────────────────────────────── */}
      {history.length === 0 && (
        <EmptyState
          icon="💸"
          title="No withdrawals yet"
          hint="Your withdrawal requests will appear here."
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Withdrawal history row
═══════════════════════════════════════════════════════════ */
function WithdrawalRow({ withdrawal }: { withdrawal: WithdrawalRequest }) {
  const statusTone =
    withdrawal.status === 'approved'
      ? 'green'
      : withdrawal.status === 'declined'
        ? 'rose'
        : 'amber';

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-100/60">
      <div className="flex items-center gap-3 p-4">
        <span
          className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl ${
            withdrawal.status === 'approved'
              ? 'bg-brand-500/10 text-brand-700'
              : withdrawal.status === 'declined'
                ? 'bg-rose-500/10 text-rose-600'
                : 'bg-amber-500/10 text-amber-600'
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            {withdrawal.status === 'approved' ? (
              <path d="m5 12 5 5 9-11" />
            ) : withdrawal.status === 'declined' ? (
              <path d="M18 6 6 18M6 6l12 12" />
            ) : (
              <>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </>
            )}
          </svg>
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-black tracking-tight text-ink-900">
            {formatNaira(withdrawal.amount)}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-ink-400">
            {formatDate(withdrawal.createdAt)}
          </p>
        </div>

        <Badge tone={statusTone}>{withdrawal.status}</Badge>
      </div>

      {withdrawal.status === 'declined' && withdrawal.declineReason && (
        <div className="border-t border-rose-100/70 bg-rose-50/70 px-4 py-2.5">
          <p className="text-[11.5px] font-semibold text-rose-800">
            {withdrawal.declineReason}
          </p>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Bullet
═══════════════════════════════════════════════════════════ */
function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 grid h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
      <span className="text-[12px] font-medium leading-relaxed text-amber-900/90">
        {children}
      </span>
    </li>
  );
}
