import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getWallet } from '@/services/wallet.service';
import { requestWithdrawal, listWithdrawals } from '@/services/withdrawal.service';
import { getSavedPayout, type SavedPayout } from '@/services/payout.service';
import type { WalletSummary, WithdrawalRequest } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { formatNaira, formatDate, maskAccountNumber } from '@/utils/format';
import { toast } from '@/hooks/useToast';
import { ApiClientError } from '@/services/api';

export default function WithdrawalPage() {
  const navigate = useNavigate();
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [payout, setPayout] = useState<SavedPayout | null>(null);
  const [history, setHistory] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    Promise.allSettled([getWallet(), getSavedPayout(), listWithdrawals()]).then(
      ([w, p, h]) => {
        if (!alive) return;
        if (w.status === 'fulfilled') setWallet(w.value);
        if (p.status === 'fulfilled') setPayout(p.value);
        if (h.status === 'fulfilled') setHistory(Array.isArray(h.value) ? h.value : []);
        setLoading(false);
      }
    );
    return () => { alive = false; };
  }, []);

  const balance = parseFloat(wallet?.walletBalance ?? '0');
  const parsedAmount = parseFloat(amount) || 0;
  const hasBalance = balance > 0;
  const hasPayout = !!payout && payout.accountNumber.length === 10;
  const meetsMinimum = parsedAmount >= 100;
  const meetsBalance = parsedAmount > 0 && parsedAmount <= balance;
  const canSubmit = hasBalance && hasPayout && meetsMinimum && meetsBalance && !submitting;

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
      toast.success('Withdrawal requested');
      setAmount('');
      const [w, h] = await Promise.all([
        getWallet().catch(() => wallet),
        listWithdrawals().catch(() => history),
      ]);
      if (w) setWallet(w);
      if (Array.isArray(h)) setHistory(h);
    } catch (e) {
      const err = e as ApiClientError;
      if (err.code === 'WITHDRAWAL_MIN' || /minimum/i.test(err.message))
        setError('Minimum withdrawal is ₦100');
      else if (err.code === 'WITHDRAWAL_INSUFFICIENT' || /insufficient/i.test(err.message))
        setError('Not enough balance for this withdrawal');
      else setError(err.message || 'Could not submit withdrawal request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={26} tone="brand" />
      </div>
    );
  }

  /* ═══════════════════════════════════════════════
     No payout account set up
  ═══════════════════════════════════════════════ */
  if (!hasPayout) {
    return (
      <div className="space-y-5 pb-2">
        <div>
          <h1 className="text-[24px] font-bold tracking-[-0.02em] text-ink-900">Withdraw</h1>
          <p className="mt-1 text-[12.5px] font-medium text-ink-400">
            Set up your payout account first
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-amber-200 bg-amber-50/70 p-5">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-amber-500 text-white">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4M12 17h.01" />
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </span>
            <div>
              <p className="text-[13.5px] font-semibold text-amber-900">No payout account</p>
              <p className="mt-0.5 text-[11.5px] font-medium text-amber-800/80">
                Add your bank details before we can send funds
              </p>
            </div>
          </div>

          <ul className="mt-4 space-y-1.5">
            <Bullet>Add your bank and 10-digit account number</Bullet>
            <Bullet>We verify the account name instantly</Bullet>
            <Bullet>Then come back here to withdraw</Bullet>
          </ul>

          <Button variant="primary" size="lg" block className="mt-5" onClick={() => navigate('/payout')}>
            Set up payout account
          </Button>
        </div>
      </div>
    );
  }

  /* ═══════════════════════════════════════════════
     Main withdrawal view (2-col on desktop)
  ═══════════════════════════════════════════════ */
  return (
    <div className="pb-2">
      <div className="mb-5">
        <h1 className="text-[24px] font-bold tracking-[-0.02em] text-ink-900">Withdraw</h1>
        <p className="mt-1 text-[12.5px] font-medium text-ink-400">
          Transfer your cashback balance to your bank
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-6">
        {/* ─── LEFT: balance + form ─────────────────── */}
        <div className="space-y-4">
          {/* Balance card */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-ink-900 via-ink-900 to-ink-800 p-5 text-white">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-40"
              style={{ background: 'radial-gradient(circle, rgba(34,197,94,.5), transparent 65%)' }}
            />
            <div className="relative">
              <p className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-white/50">
                Available balance
              </p>
              <p className="mt-2 text-[32px] font-bold leading-none tracking-[-0.03em] tabular-nums">
                {formatNaira(balance)}
              </p>
            </div>
          </div>

          {/* Payout account preview */}
          <div className="flex items-center gap-3 rounded-xl bg-white p-4 ring-1 ring-ink-200/70">
            <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <path d="M5 21V10l7-5 7 5v11" />
                <path d="M9 21v-6h6v6" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">
                Sending to
              </p>
              <p className="mt-0.5 truncate text-[13.5px] font-semibold tracking-tight text-ink-900">
                {payout!.bankName}
              </p>
              <p className="mt-0.5 truncate font-mono text-[11px] font-medium text-ink-400">
                {maskAccountNumber(payout!.accountNumber)} · {payout!.accountName}
              </p>
            </div>
            <Link
              to="/payout"
              className="flex-shrink-0 text-[11.5px] font-semibold text-brand-600 transition-colors hover:text-brand-700"
            >
              Change
            </Link>
          </div>

          {/* Amount input */}
          <div className="space-y-4 rounded-xl bg-white p-5 ring-1 ring-ink-200/70">
            <label className="block">
              <span className="mb-2 block text-[12px] font-semibold tracking-[-0.005em] text-ink-700">
                Amount to withdraw
              </span>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-ink-400">
                  ₦
                </span>
                <input
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => { setError(null); setAmount(e.target.value.replace(/[^\d.]/g, '')); }}
                  placeholder="0.00"
                  disabled={submitting}
                  className="h-12 w-full rounded-lg border-0 bg-white pl-9 pr-4 text-[15px] font-semibold tabular-nums text-ink-900 outline-none ring-1 ring-inset ring-ink-200 transition-colors placeholder:font-normal placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500 disabled:opacity-60"
                />
              </div>

              {hasBalance && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {[1000, 2000, 5000].filter((v) => v <= balance).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setAmount(String(v))}
                      disabled={submitting}
                      className="rounded-md bg-ink-50 px-3 py-1.5 text-[11.5px] font-semibold tabular-nums text-ink-700 ring-1 ring-inset ring-ink-200 transition-colors hover:bg-ink-100 disabled:opacity-50"
                    >
                      ₦{v.toLocaleString()}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setAmount(String(balance))}
                    disabled={submitting}
                    className="rounded-md bg-brand-50 px-3 py-1.5 text-[11.5px] font-semibold text-brand-700 ring-1 ring-inset ring-brand-200 transition-colors hover:bg-brand-100 disabled:opacity-50"
                  >
                    Max
                  </button>
                </div>
              )}

              {parsedAmount > 0 && !meetsMinimum && (
                <p className="mt-2 text-[11.5px] font-medium text-amber-600">
                  Minimum withdrawal is ₦100
                </p>
              )}
              {parsedAmount > balance && (
                <p className="mt-2 text-[11.5px] font-medium text-rose-600">
                  Amount exceeds your available balance
                </p>
              )}
            </label>

            {error && (
              <div className="rounded-lg bg-rose-50 px-3.5 py-3 ring-1 ring-inset ring-rose-200">
                <p className="text-[12px] font-medium text-rose-700">{error}</p>
              </div>
            )}

            <Button
              variant="brand"
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
        </div>

        {/* ─── RIGHT: history (desktop) ─────────────── */}
        <aside className="mt-5 space-y-3 lg:mt-0">
          <div className="sticky top-20 space-y-3">
            <h2 className="px-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-400">
              Recent requests
            </h2>

            {history.length === 0 ? (
              <div className="rounded-xl bg-white p-5 text-center ring-1 ring-ink-200/70">
                <span className="mb-2 block text-xl opacity-40">💸</span>
                <p className="text-[12.5px] font-semibold text-ink-700">No withdrawals yet</p>
                <p className="mt-1 text-[11px] font-medium text-ink-400">
                  Your requests will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {history.slice(0, 6).map((w) => (
                  <WithdrawalRow key={w.id} withdrawal={w} />
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function WithdrawalRow({ withdrawal }: { withdrawal: WithdrawalRequest }) {
  const tone =
    withdrawal.status === 'approved' ? 'green'
    : withdrawal.status === 'declined' ? 'rose' : 'amber';

  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-ink-200/70">
      <div className="flex items-center gap-3 p-4">
        <span
          className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg ${
            withdrawal.status === 'approved'
              ? 'bg-brand-50 text-brand-600'
              : withdrawal.status === 'declined'
                ? 'bg-rose-50 text-rose-600'
                : 'bg-amber-50 text-amber-600'
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
          <p className="text-[13px] font-semibold tabular-nums tracking-tight text-ink-900">
            {formatNaira(withdrawal.amount)}
          </p>
          <p className="mt-0.5 text-[10.5px] font-medium text-ink-400">
            {formatDate(withdrawal.createdAt)}
          </p>
        </div>
        <Badge tone={tone}>{withdrawal.status}</Badge>
      </div>
      {withdrawal.status === 'declined' && withdrawal.declineReason && (
        <div className="border-t border-rose-100 bg-rose-50/60 px-4 py-2.5">
          <p className="text-[11px] font-medium text-rose-800">{withdrawal.declineReason}</p>
        </div>
      )}
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 grid h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-500" />
      <span className="text-[12px] font-medium leading-relaxed text-amber-900/90">{children}</span>
    </li>
  );
}