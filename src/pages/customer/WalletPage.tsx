import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getWallet } from '@/services/wallet.service';
import type { Transaction, WalletSummary } from '@/types';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { formatNaira, formatRelative } from '@/utils/format';

type Filter = 'all' | 'credits' | 'withdrawals';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'credits', label: 'Credits' },
  { key: 'withdrawals', label: 'Withdrawals' },
];

export default function WalletPage() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getWallet();
      setWallet(data);
    } catch {
      setWallet(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const transactions: Transaction[] = useMemo(
    () => (Array.isArray(wallet?.recentTransactions) ? wallet!.recentTransactions : []),
    [wallet]
  );

  const isCredit = (t: Transaction) =>
    t.type === 'cashback_credit' || t.type === 'withdrawal_reversal' || t.type === 'credit';

  const filtered = useMemo(() => {
    if (filter === 'all') return transactions;
    if (filter === 'credits') return transactions.filter(isCredit);
    return transactions.filter((t) => !isCredit(t));
  }, [transactions, filter]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={26} tone="brand" />
      </div>
    );
  }

  if (!wallet) {
    return (
      <EmptyState
        icon="⚠️"
        title="Could not load wallet"
        hint="Please try again shortly."
        action={<Button variant="primary" onClick={load}>Retry</Button>}
      />
    );
  }

  const balance = parseFloat(wallet.walletBalance ?? '0');
  const pending = parseFloat(wallet.pendingBalance ?? '0');
  const lifetime = parseFloat(wallet.totalEarned ?? '0');
  const canWithdraw = balance > 0;

  return (
    <div className="space-y-5 pb-2">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-[-0.02em] text-ink-900">Wallet</h1>
          <p className="mt-1 text-[12.5px] font-medium text-ink-400">
            Rewards, cash-outs and history
          </p>
        </div>
        <RefreshButton onRefresh={load} label="Refresh wallet" />
      </div>

      {/* ─── 3-stat row (desktop) ──────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Balance — the hero */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-ink-900 via-ink-900 to-ink-800 p-5 text-white shadow-md shadow-ink-950/20 sm:col-span-2">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,.5), transparent 65%)' }}
          />
          <div className="relative">
            <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/50">
              Available balance
            </p>
            <p className="mt-2 text-[32px] font-bold leading-none tracking-[-0.03em] tabular-nums">
              {formatNaira(balance)}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => navigate('/scan')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-2 text-[12px] font-semibold text-ink-950 transition-colors hover:bg-brand-600 active:scale-[.97]"
              >
                📷 Scan pack
              </button>
              <button
                onClick={() => canWithdraw && navigate('/withdrawal')}
                disabled={!canWithdraw}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-2 text-[12px] font-semibold text-white ring-1 ring-inset ring-white/15 transition-colors hover:bg-white/15 disabled:opacity-40"
              >
                💸 Withdraw
              </button>
            </div>
          </div>
        </div>

        {/* Lifetime + pending */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
          <div className="rounded-xl bg-white p-4 ring-1 ring-ink-200/70">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
              Lifetime
            </p>
            <p className="mt-1 text-[18px] font-bold tabular-nums tracking-[-0.02em] text-brand-700">
              {formatNaira(lifetime)}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 ring-1 ring-ink-200/70">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
              Pending
            </p>
            <p className="mt-1 text-[18px] font-bold tabular-nums tracking-[-0.02em] text-amber-600">
              {formatNaira(pending)}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Transactions ──────────────────────────── */}
      <div>
        <div className="mb-3 flex items-end justify-between">
          <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink-900">
            Transactions
          </h3>
          {transactions.length > 0 && (
            <span className="text-[11.5px] font-medium text-ink-400">
              {transactions.length} total
            </span>
          )}
        </div>

        {transactions.length > 0 && (
          <div className="scrollbar-none -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
            {FILTERS.map((f) => {
              const isActive = filter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-[12px] font-semibold tracking-[-0.005em] transition-colors ${
                    isActive
                      ? 'bg-ink-900 text-white'
                      : 'bg-white text-ink-500 ring-1 ring-inset ring-ink-200 hover:text-ink-900'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        )}

        {transactions.length === 0 ? (
          <EmptyState
            icon="💳"
            title="No transactions yet"
            hint="Scan a product pack to earn your first ₦100 cashback."
          />
        ) : filtered.length === 0 ? (
          <EmptyState icon="🔍" title={`No ${filter} transactions`} hint="Try a different filter." />
        ) : (
          <div className="overflow-hidden rounded-xl bg-white ring-1 ring-ink-200/70">
            {filtered.map((t, idx) => (
              <TxRow
                key={t.id}
                txn={t}
                isCredit={isCredit(t)}
                isLast={idx === filtered.length - 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TxRow({
  txn, isCredit, isLast,
}: {
  txn: Transaction;
  isCredit: boolean;
  isLast: boolean;
}) {
  const title = isCredit
    ? txn.type === 'withdrawal_reversal'
      ? 'Withdrawal reversed'
      : 'Vickkyaku reward'
    : 'Withdrawal to bank';

  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 ${!isLast ? 'border-b border-ink-100' : ''}`}>
      <span
        className={`grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg ${
          isCredit
            ? 'bg-brand-50 text-brand-600'
            : 'bg-rose-50 text-rose-600'
        }`}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          {isCredit ? (
            <path d="M12 19V5M5 12l7-7 7 7" />
          ) : (
            <path d="M12 5v14M5 12l7 7 7-7" />
          )}
        </svg>
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[12.5px] font-semibold tracking-[-0.005em] text-ink-900">
          {title}
        </p>
        <p className="mt-0.5 truncate text-[10.5px] font-medium text-ink-400">
          {txn.reference && <span className="font-mono">#{txn.reference}</span>}
          {txn.reference && ' · '}
          {formatRelative(txn.createdAt)}
        </p>
      </div>

      <span
        className={`whitespace-nowrap text-[13.5px] font-bold tabular-nums tracking-[-0.01em] ${
          isCredit ? 'text-brand-700' : 'text-rose-600'
        }`}
      >
        {isCredit ? '+' : '−'}
        {formatNaira(txn.amount)}
      </span>
    </div>
  );
}