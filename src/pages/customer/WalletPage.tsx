import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWallet } from '@/services/wallet.service';
import type { Transaction, WalletSummary } from '@/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { formatNaira, formatRelative } from '@/utils/format';
import { RefreshButton } from '@/components/ui/RefreshButton';

/* ═══════════════════════════════════════════════════════════
   Transaction filter tabs
═══════════════════════════════════════════════════════════ */
type Filter = 'all' | 'credits' | 'withdrawals';

const FILTERS: Array<{ key: Filter; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'credits', label: 'Credits' },
  { key: 'withdrawals', label: 'Withdrawals' },
];

export default function WalletPage() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  /* ─── Load ─────────────────────────────────────────────── */
  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getWallet();
      setWallet(data);
    } catch {
      setWallet(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /* ─── Derived ──────────────────────────────────────────── */
  const transactions: Transaction[] = useMemo(
    () =>
      Array.isArray(wallet?.recentTransactions) ? wallet!.recentTransactions : [],
    [wallet]
  );

  const filteredTxns = useMemo(() => {
    if (filter === 'all') return transactions;
    if (filter === 'credits') {
      return transactions.filter(
        (t) =>
          t.type === 'cashback_credit' ||
          t.type === 'withdrawal_reversal' ||
          t.type === 'credit'
      );
    }
    return transactions.filter(
      (t) => t.type === 'withdrawal_debit' || t.type === 'debit'
    );
  }, [transactions, filter]);

  const counts = useMemo(
    () => ({
      all: transactions.length,
      credits: transactions.filter(
        (t) =>
          t.type === 'cashback_credit' ||
          t.type === 'withdrawal_reversal' ||
          t.type === 'credit'
      ).length,
      withdrawals: transactions.filter(
        (t) => t.type === 'withdrawal_debit' || t.type === 'debit'
      ).length,
    }),
    [transactions]
  );

  /* ─── Loading ──────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-[26px] font-black tracking-[-0.03em]">My Wallet</h1>
        <div className="flex justify-center py-16">
          <Spinner size={28} className="!border-slate-300 !border-t-brand-500" />
        </div>
      </div>
    );
  }

  if (!wallet) {
    return (
      <EmptyState
        icon="⚠️"
        title="Could not load wallet"
        hint="Please try again shortly."
        action={
          <Button variant="primary" onClick={() => load()}>
            Retry
          </Button>
        }
      />
    );
  }

  const balance = parseFloat(wallet.walletBalance ?? '0');
  const pending = parseFloat(wallet.pendingBalance ?? '0');
  const lifetime = parseFloat(wallet.totalEarned ?? '0');
  const canWithdraw = balance > 0;

  return (
    <div className="space-y-5 pb-2">
      {/* ═══════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════ */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[26px] font-black tracking-[-0.03em] text-ink-900">
            My Wallet
          </h1>
          <p className="mt-1 text-[12.5px] font-medium text-ink-400">
            Track rewards and withdraw to your bank
          </p>
        </div>
        <RefreshButton onRefresh={() => load(true)} label="Refresh wallet" />
      </div>

      {/* ═══════════════════════════════════════════════════
          BALANCE CARD
      ═══════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F2A24] via-[#0C1F1B] to-[#0B0F14] p-5 shadow-[0_16px_36px_-16px_rgba(11,15,20,.7)]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full opacity-70"
          style={{
            background:
              'radial-gradient(circle, rgba(52,211,153,.4), transparent 65%)',
          }}
        />

        <div className="relative">
          <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-white/45">
            Available balance
          </p>
          <p className="mt-2 text-[36px] font-black leading-none tracking-[-0.03em] text-white">
            {formatNaira(balance)}
          </p>

          {/* Lifetime + pending row */}
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/[.08] pt-3.5">
            <div>
              <div className="flex items-center gap-1.5">
                <svg viewBox="0 0 24 24" className="h-3 w-3 text-brand-300" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span className="text-[10.5px] font-black uppercase tracking-wider text-white/40">
                  Lifetime
                </span>
              </div>
              <p className="mt-1 text-[15px] font-black text-brand-300">
                {formatNaira(lifetime)}
              </p>
            </div>

            {pending > 0 && (
              <div>
                <div className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" className="h-3 w-3 text-amber-300" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span className="text-[10.5px] font-black uppercase tracking-wider text-white/40">
                    Pending
                  </span>
                </div>
                <p className="mt-1 text-[15px] font-black text-amber-300">
                  {formatNaira(pending)}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          ACTION BUTTONS
      ═══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => navigate('/scan')}
          className="flex items-center gap-3 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 p-3.5 text-left text-white shadow-[0_10px_24px_-12px_rgba(16,185,129,.9)] transition active:scale-[.97]"
        >
          <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-white/20">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 7V5a2 2 0 0 1 2-2h2" />
              <path d="M17 3h2a2 2 0 0 1 2 2v2" />
              <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
              <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
              <path d="M3 12h18" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-[12.5px] font-black leading-tight">Scan pack</p>
            <p className="mt-0.5 text-[10.5px] font-bold opacity-70">Earn ₦100</p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => canWithdraw && navigate('/withdrawal')}
          disabled={!canWithdraw}
          className="flex items-center gap-3 rounded-2xl bg-white p-3.5 text-left text-ink-900 shadow-card ring-1 ring-ink-100/60 transition active:scale-[.97] disabled:opacity-40 disabled:pointer-events-none"
        >
          <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl bg-brand-500/10 text-brand-700">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v14" />
              <path d="m5 11 7 7 7-7" />
              <path d="M5 21h14" />
            </svg>
          </span>
          <div className="min-w-0">
            <p className="text-[12.5px] font-black leading-tight">Withdraw</p>
            <p className="mt-0.5 text-[10.5px] font-bold text-ink-400">
              {canWithdraw ? 'To bank' : 'No balance'}
            </p>
          </div>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════
          TRANSACTIONS
      ═══════════════════════════════════════════════════ */}
      <div>
        <div className="mb-3 flex items-end justify-between">
          <h3 className="text-[15px] font-extrabold tracking-tight text-ink-900">
            Transactions
          </h3>
          {transactions.length > 0 && (
            <span className="text-[11px] font-bold text-ink-400">
              {transactions.length} total
            </span>
          )}
        </div>

        {/* Filter tabs */}
        {transactions.length > 0 && (
          <div className="scrollbar-none -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
            {FILTERS.map((f) => {
              const isActive = filter === f.key;
              const n = counts[f.key];
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-[11.5px] font-black tracking-tight transition ${
                    isActive
                      ? 'bg-ink-900 text-white shadow-[0_4px_12px_-4px_rgba(11,16,28,.4)]'
                      : 'bg-white text-ink-500 ring-1 ring-inset ring-ink-100/70 hover:text-ink-900'
                  }`}
                >
                  {f.label}
                  {n > 0 && (
                    <span className={`ml-1.5 ${isActive ? 'text-brand-300' : 'text-ink-400'}`}>
                      {n}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-10 text-center shadow-card ring-1 ring-ink-100/60">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-ink-100/70 text-ink-400">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
                <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
                <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
              </svg>
            </span>
            <p className="mt-3 text-[13px] font-bold text-ink-900">
              No transactions yet
            </p>
            <p className="mt-1 max-w-[240px] text-[11.5px] font-medium leading-relaxed text-ink-400">
              Scan a product pack to earn your first ₦100 cashback.
            </p>
            <button
              type="button"
              onClick={() => navigate('/scan')}
              className="mt-4 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 px-4 py-2.5 text-[12px] font-black text-white shadow-[0_8px_20px_-10px_rgba(16,185,129,.85)] transition active:scale-95"
            >
              Scan a pack
            </button>
          </div>
        ) : filteredTxns.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl bg-white px-6 py-8 text-center shadow-card ring-1 ring-ink-100/60">
            <p className="text-[12.5px] font-bold text-ink-700">
              No {filter} transactions
            </p>
            <p className="mt-1 text-[11px] font-medium text-ink-400">
              Try a different filter.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-100/60">
            {filteredTxns.map((t, idx) => (
              <TransactionRow
                key={t.id}
                transaction={t}
                isLast={idx === filteredTxns.length - 1}
              />
            ))}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════
          WITHDRAWAL CTA (bottom)
      ═══════════════════════════════════════════════════ */}
      {canWithdraw && (
        <div className="pt-2">
          <Button
            variant="outline"
            size="lg"
            block
            onClick={() => navigate('/withdrawal')}
          >
            <svg viewBox="0 0 24 24" className="mr-1.5 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v14" />
              <path d="m5 11 7 7 7-7" />
              <path d="M5 21h14" />
            </svg>
            Request cash-out to bank
          </Button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Transaction Row
═══════════════════════════════════════════════════════════ */
function TransactionRow({
  transaction,
  isLast,
}: {
  transaction: Transaction;
  isLast: boolean;
}) {
  const isCredit =
    transaction.type === 'cashback_credit' ||
    transaction.type === 'withdrawal_reversal' ||
    transaction.type === 'credit';

  const title = isCredit
    ? transaction.type === 'withdrawal_reversal'
      ? 'Withdrawal reversed'
      : 'Vickkyaku reward'
    : 'Withdrawal to bank';

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 ${
        !isLast ? 'border-b border-ink-100/70' : ''
      }`}
    >
      {/* Icon */}
      <span
        className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl ${
          isCredit
            ? 'bg-brand-500/12 text-brand-700'
            : 'bg-rose-500/10 text-rose-600'
        }`}
      >
        {isCredit ? (
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        )}
      </span>

      {/* Details */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-bold tracking-tight text-ink-900">
          {title}
        </p>
        <p className="mt-0.5 truncate text-[10.5px] font-semibold text-ink-400">
          {transaction.reference && (
            <span className="font-mono">#{transaction.reference}</span>
          )}
          {transaction.reference && ' · '}
          {formatRelative(transaction.createdAt)}
        </p>
      </div>

      {/* Amount */}
      <span
        className={`whitespace-nowrap text-[13.5px] font-black tracking-tight ${
          isCredit ? 'text-brand-700' : 'text-rose-600'
        }`}
      >
        {isCredit ? '+' : '−'}
        {formatNaira(transaction.amount)}
      </span>
    </div>
  );
}
