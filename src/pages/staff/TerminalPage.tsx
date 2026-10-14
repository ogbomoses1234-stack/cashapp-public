import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyStock } from '@/services/staff.service';
import type { StaffStockStats, StaffStockItem } from '@/services/staff.service';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { formatRelative } from '@/utils/format';
import { ApiClientError } from '@/services/api';

export default function TerminalPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StaffStockStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setStats(await getMyStock());
    } catch (e) {
      setError((e as ApiClientError).message ?? 'Could not load your terminal');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const recent = stats?.items.slice(0, 6) ?? [];
  const progressPct = useMemo(() => {
    const taken = stats?.takenToday ?? 0;
    const sold = stats?.sold ?? 0;
    if (taken === 0) return 0;
    return Math.round((sold / taken) * 100);
  }, [stats]);

  return (
    <div className="space-y-5 pb-2">
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-violet-600">
            <span className="text-[13px]">🏪</span>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]">
              Seller Terminal
            </p>
          </div>
          <h1 className="mt-1 text-[24px] font-bold leading-tight tracking-[-0.02em] text-ink-900">
            My Stock-Out
          </h1>
        </div>
        <RefreshButton onRefresh={load} label="Refresh terminal" />
      </div>

      {error && !loading && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-[12.5px] font-semibold text-rose-900">Could not load terminal</p>
          <p className="mt-1 text-[11.5px] font-medium text-rose-700/80">{error}</p>
          <Button variant="primary" size="sm" onClick={load} className="mt-3">
            Try again
          </Button>
        </div>
      )}

      {/* Desktop 2-col */}
      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-6">
        {/* ─── LEFT: counter card ────────────────────── */}
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-950 via-ink-900 to-ink-950 shadow-md shadow-violet-950/20">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-60"
              style={{ background: 'radial-gradient(circle, rgba(139,92,246,.65), transparent 65%)' }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-24 -left-16 h-48 w-48 rounded-full opacity-30"
              style={{ background: 'radial-gradient(circle, rgba(34,197,94,.4), transparent 68%)' }}
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
                maskImage: 'radial-gradient(circle at 80% 0%, #000, transparent 70%)',
              }}
            />

            <div className="relative p-6">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-white/50">
                  Units taken today
                </p>
                {progressPct > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/20 px-2.5 py-1 text-[10px] font-bold text-brand-300 ring-1 ring-inset ring-brand-400/30">
                    ✨ {progressPct}% sold
                  </span>
                )}
              </div>

              {loading ? (
                <div className="mt-3 h-14 w-40 animate-pulse rounded-lg bg-white/[.06]" />
              ) : (
                <div className="mt-2 flex items-baseline gap-2">
                  <p className="text-[56px] font-bold leading-none tracking-[-0.045em] tabular-nums text-white">
                    {stats?.takenToday ?? 0}
                  </p>
                  <span className="text-[15px] font-semibold tracking-tight text-white/40">
                    units
                  </span>
                </div>
              )}

              {!loading && (stats?.takenToday ?? 0) > 0 && (
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between text-[10.5px] font-bold">
                    <span className="uppercase tracking-wider text-white/50">Sale progress</span>
                    <span className="text-brand-300 tabular-nums">
                      {stats?.sold ?? 0} / {stats?.takenToday ?? 0}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[.08]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-700"
                      style={{ width: `${Math.max(4, progressPct)}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/[.08] pt-5">
                <CounterStat label="Sold today" value={stats?.sold ?? 0} tone="green" />
                <CounterStat label="Awaiting sale" value={stats?.awaitingSale ?? 0} tone="amber" />
              </div>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            type="button"
            onClick={() => navigate('/staff/scan')}
            className="group relative flex w-full items-center gap-3.5 overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 p-4 text-left shadow-md shadow-violet-500/30 transition-colors hover:shadow-lg active:scale-[.99]"
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-2xl"
            />
            <span className="relative grid h-12 w-12 flex-shrink-0 place-items-center rounded-lg bg-white/[.18] text-white ring-1 ring-inset ring-white/25">
              <ScanIcon />
            </span>
            <div className="relative min-w-0 flex-1">
              <p className="text-[14px] font-bold tracking-tight text-white">
                Scan items for route allocation
              </p>
              <p className="mt-0.5 text-[11.5px] font-medium text-white/70">
                Log products you're taking out for sale
              </p>
            </div>
            <span className="relative grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-white/[.18] text-white ring-1 ring-inset ring-white/25 transition-transform group-hover:translate-x-0.5">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </span>
          </button>
        </div>

        {/* ─── RIGHT: ledger ────────────────────────── */}
        <aside className="mt-5 lg:mt-0">
          <div className="sticky top-20">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-ink-900">
                  Today's scan ledger
                </h2>
                <p className="mt-0.5 text-[11px] font-medium text-ink-400">
                  {recent.length} recent {recent.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              {(stats?.items.length ?? 0) > 0 && (
                <button
                  onClick={() => navigate('/staff/stock')}
                  className="text-[11.5px] font-semibold text-violet-600 transition-colors hover:text-violet-700"
                >
                  See all →
                </button>
              )}
            </div>

            {loading ? (
              <ListSkeleton count={4} lines={2} />
            ) : recent.length === 0 ? (
              <EmptyState
                icon="📦"
                title="No scans yet"
                hint="Tap the scan button to log products you're taking out."
              />
            ) : (
              <div className="space-y-2.5">
                {recent.map((item) => (
                  <LedgerCard key={item.serialNumber} item={item} />
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

function CounterStat({
  label, value, tone,
}: {
  label: string;
  value: number;
  tone: 'green' | 'amber';
}) {
  const color = tone === 'green' ? 'text-brand-300' : 'text-amber-300';
  const bg = tone === 'green' ? 'bg-brand-500/15' : 'bg-amber-500/15';
  return (
    <div className="flex items-center gap-3">
      <span className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg ${bg} ${color} ring-1 ring-inset ring-white/10`}>
        <span className="text-[14px]">{tone === 'green' ? '✓' : '⏱'}</span>
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">{label}</p>
        <p className={`mt-0.5 text-[18px] font-bold tabular-nums tracking-[-0.02em] ${color}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function LedgerCard({ item }: { item: StaffStockItem }) {
  const isSold = item.status === 'Redeemed';
  return (
    <div className="flex items-center gap-3.5 rounded-xl bg-white p-3.5 ring-1 ring-ink-200/70 transition-colors hover:ring-ink-300">
      <div
        className={`relative grid h-11 w-11 flex-shrink-0 place-items-center overflow-hidden rounded-lg ${
          isSold
            ? 'bg-gradient-to-br from-brand-50 to-brand-100/60 text-brand-600'
            : 'bg-gradient-to-br from-violet-50 to-violet-100/60 text-violet-600'
        }`}
      >
        <span className="text-[16px]">{isSold ? '✓' : '📦'}</span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold tracking-[-0.005em] text-ink-900">
          {item.productTitle}
        </p>
        <div className="mt-0.5 flex items-center gap-2 text-[10.5px] font-medium text-ink-400">
          <span className="truncate font-mono font-semibold tracking-wider">
            #{item.serialNumber}
          </span>
          <span className="h-1 w-1 rounded-full bg-ink-300" />
          <span className="truncate">{formatRelative(item.dispatchedAt)}</span>
        </div>
      </div>

      <span
        className={`flex-shrink-0 rounded-md px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ring-1 ring-inset ${
          isSold
            ? 'bg-brand-50 text-brand-700 ring-brand-200'
            : 'bg-violet-50 text-violet-700 ring-violet-200'
        }`}
      >
        {isSold ? 'Sold' : 'Taken'}
      </span>
    </div>
  );
}

function ScanIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M3 12h18" />
    </svg>
  );
}