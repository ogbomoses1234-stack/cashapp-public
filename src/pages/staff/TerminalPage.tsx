import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyStock } from '@/services/staff.service';
import type { StaffStockStats, StaffStockItem } from '@/services/staff.service';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { ListSkeleton } from '@/components/ui/Skeleton';
import {
  StoreIcon,
  PackageIcon,
  CheckIcon,
  ClockIcon,
  ChevronRightIcon,
  ScanIcon,
  SparklesIcon,
} from '@/components/icons/StaffIcons';
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
      const data = await getMyStock();
      setStats(data);
    } catch (e) {
      const err = e as ApiClientError;
      setError(err.message ?? 'Could not load your terminal');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const recentScans = stats?.items.slice(0, 6) ?? [];
  const progressPct = useMemo(() => {
    const taken = stats?.takenToday ?? 0;
    const sold = stats?.sold ?? 0;
    if (taken === 0) return 0;
    return Math.round((sold / taken) * 100);
  }, [stats]);

  return (
    <div className="space-y-5 pb-2">
      {/* ═══════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════ */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-violet-500">
            <StoreIcon size={13} />
            <p className="text-[10.5px] font-black uppercase tracking-[0.16em]">
              Seller Terminal
            </p>
          </div>
          <h1 className="mt-1 text-[24px] font-black leading-tight tracking-[-0.025em] text-ink-900">
            My Stock-Out
          </h1>
        </div>
        <RefreshButton onRefresh={load} label="Refresh terminal" />
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-[12.5px] font-black text-rose-900">
            Could not load terminal
          </p>
          <p className="mt-1 text-[11.5px] font-medium text-rose-700/80">
            {error}
          </p>
          <Button variant="primary" size="sm" onClick={load} className="mt-3">
            Try again
          </Button>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          COUNTER CARD — premium
      ═══════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-[#1A1538] via-[#0F0A2E] to-[#0B0F14] shadow-[0_24px_48px_-24px_rgba(11,15,20,.75)]">
        {/* Ambient glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full opacity-70"
          style={{
            background:
              'radial-gradient(circle, rgba(139,92,246,.6), transparent 65%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -left-16 h-56 w-56 rounded-full opacity-40"
          style={{
            background:
              'radial-gradient(circle, rgba(52,211,153,.35), transparent 68%)',
          }}
        />

        {/* Faint grid */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage:
              'radial-gradient(circle at 80% 0%, #000, transparent 70%)',
          }}
        />

        <div className="relative p-6">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <p className="text-[10.5px] font-black uppercase tracking-[0.16em] text-white/45">
              Units taken today
            </p>
            {progressPct > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-500/15 px-2.5 py-1 text-[10px] font-black text-brand-300 ring-1 ring-inset ring-brand-400/30">
                <SparklesIcon size={10} />
                {progressPct}% sold
              </span>
            )}
          </div>

          {/* Big number */}
          {loading ? (
            <div className="mt-3 h-14 w-40 animate-pulse rounded-xl bg-white/[.06]" />
          ) : (
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-[56px] font-black leading-none tracking-[-0.045em] text-white">
                {stats?.takenToday ?? 0}
              </p>
              <span className="text-[15px] font-bold tracking-tight text-white/40">
                units
              </span>
            </div>
          )}

          {/* Progress bar */}
          {!loading && (stats?.takenToday ?? 0) > 0 && (
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-[10.5px] font-black">
                <span className="uppercase tracking-wider text-white/45">
                  Sale progress
                </span>
                <span className="text-brand-300">
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

          {/* Stat grid */}
          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-white/[.08] pt-5">
            <CounterStat
              Icon={CheckIcon}
              label="Sold today"
              value={stats?.sold ?? 0}
              tone="green"
            />
            <CounterStat
              Icon={ClockIcon}
              label="Awaiting sale"
              value={stats?.awaitingSale ?? 0}
              tone="amber"
            />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          PRIMARY CTA — refined
      ═══════════════════════════════════════════════════ */}
      <button
        type="button"
        onClick={() => navigate('/staff/scan')}
        className="group relative flex w-full items-center gap-3.5 overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-violet-700 p-4 text-left shadow-[0_16px_32px_-16px_rgba(139,92,246,.95)] transition-all duration-200 hover:shadow-[0_20px_40px_-18px_rgba(139,92,246,1)] active:scale-[.98]"
      >
        {/* Highlight orb */}
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-2xl"
        />

        <span className="relative grid h-12 w-12 flex-shrink-0 place-items-center rounded-[14px] bg-white/[.18] text-white ring-1 ring-inset ring-white/25 backdrop-blur-sm">
          <ScanIcon size={22} />
        </span>

        <div className="relative min-w-0 flex-1">
          <p className="text-[14px] font-black tracking-tight text-white">
            Scan items for route allocation
          </p>
          <p className="mt-0.5 text-[11.5px] font-semibold text-white/70">
            Log products you're taking out for sale
          </p>
        </div>

        <span className="relative grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-white/[.18] text-white ring-1 ring-inset ring-white/25 transition-transform duration-200 group-hover:translate-x-0.5">
          <ChevronRightIcon size={16} />
        </span>
      </button>

      {/* ═══════════════════════════════════════════════════
          LEDGER
      ═══════════════════════════════════════════════════ */}
      <section>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <h2 className="text-[15px] font-extrabold tracking-tight text-ink-900">
              Today's scan ledger
            </h2>
            <p className="mt-0.5 text-[11px] font-semibold text-ink-400">
              {recentScans.length} recent {recentScans.length === 1 ? 'item' : 'items'}
            </p>
          </div>
          {(stats?.items.length ?? 0) > 0 && (
            <button
              type="button"
              onClick={() => navigate('/staff/stock')}
              className="text-[11.5px] font-black text-violet-600 hover:text-violet-800"
            >
              See all →
            </button>
          )}
        </div>

        {loading ? (
          <ListSkeleton count={4} lines={2} />
        ) : recentScans.length === 0 ? (
          <EmptyState
            icon={<PackageIcon size={30} className="text-violet-400" />}
            title="No scans yet"
            hint="Tap the scan button above to log the products you're taking out."
          />
        ) : (
          <div className="space-y-2.5">
            {recentScans.map((item) => (
              <LedgerCard key={item.serialNumber} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Counter stat
═══════════════════════════════════════════════════════════ */
function CounterStat({
  Icon,
  label,
  value,
  tone,
}: {
  Icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: number;
  tone: 'green' | 'amber';
}) {
  const color = tone === 'green' ? 'text-brand-300' : 'text-amber-300';
  const bg = tone === 'green' ? 'bg-brand-500/15' : 'bg-amber-500/15';

  return (
    <div className="flex items-center gap-3">
      <span className={`grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl ${bg} ${color} ring-1 ring-inset ring-white/10`}>
        <Icon size={15} />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-black uppercase tracking-wider text-white/40">
          {label}
        </p>
        <p className={`mt-0.5 text-[18px] font-black tracking-tight ${color}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Ledger card — upgraded
═══════════════════════════════════════════════════════════ */
function LedgerCard({ item }: { item: StaffStockItem }) {
  const isSold = item.status === 'Redeemed';

  return (
    <div className="group flex items-center gap-3.5 rounded-2xl bg-white p-3.5 shadow-[0_2px_4px_-2px_rgba(11,15,20,.04),0_8px_20px_-12px_rgba(11,15,20,.08)] ring-1 ring-ink-100/60 transition hover:ring-ink-200 active:scale-[.995]">
      {/* Thumbnail */}
      <div
        className={`relative grid h-12 w-12 flex-shrink-0 place-items-center overflow-hidden rounded-2xl ${
          isSold
            ? 'bg-gradient-to-br from-brand-50 to-brand-100/60'
            : 'bg-gradient-to-br from-violet-50 to-violet-100/60'
        }`}
      >
        {isSold ? (
          <CheckIcon size={20} className="text-brand-600" />
        ) : (
          <PackageIcon size={20} className="text-violet-600" />
        )}

        {/* Sold corner badge */}
        {isSold && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-brand-500 text-[8px] font-black text-white ring-2 ring-white">
            ✓
          </span>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13.5px] font-bold tracking-[-0.005em] text-ink-900">
          {item.productTitle}
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="truncate font-mono text-[10.5px] font-black tracking-wider text-ink-400">
            #{item.serialNumber}
          </span>
          <span className="h-1 w-1 rounded-full bg-ink-300" />
          <span className="truncate text-[10.5px] font-semibold text-ink-400">
            {formatRelative(item.dispatchedAt)}
          </span>
        </div>
      </div>

      {/* Status pill */}
      <span
        className={`flex-shrink-0 rounded-lg px-2 py-1 text-[9.5px] font-black uppercase tracking-wider ring-1 ring-inset ${
          isSold
            ? 'bg-brand-500/12 text-brand-700 ring-brand-500/20'
            : 'bg-violet-500/12 text-violet-700 ring-violet-500/20'
        }`}
      >
        {isSold ? 'Sold' : 'Taken'}
      </span>
    </div>
  );
}
