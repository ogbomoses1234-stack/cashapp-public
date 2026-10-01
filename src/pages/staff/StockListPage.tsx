import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyStock } from '@/services/staff.service';
import type { StaffStockStats, StaffStockItem } from '@/services/staff.service';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { ListSkeleton } from '@/components/ui/Skeleton';
import {
  ClipboardIcon,
  PackageIcon,
  CheckIcon,
  ClockIcon,
  SearchIcon,
  CloseIcon,
  ScanIcon,
} from '@/components/icons/StaffIcons';
import { formatRelative } from '@/utils/format';
import { useDebounce } from '@/hooks/useDebounce';

type FilterKey = 'all' | 'taken' | 'sold';

const FILTERS: Array<{ key: FilterKey; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'taken', label: 'Taken out' },
  { key: 'sold', label: 'Sold' },
];

export default function StockListPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StaffStockStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [query, setQuery] = useState('');

  const debouncedQuery = useDebounce(query, 300);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyStock();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    let items = stats?.items ?? [];
    if (filter === 'taken') items = items.filter((i) => i.status === 'Dispatched');
    if (filter === 'sold') items = items.filter((i) => i.status === 'Redeemed');

    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      items = items.filter(
        (i) =>
          i.productTitle.toLowerCase().includes(q) ||
          i.serialNumber.toLowerCase().includes(q)
      );
    }
    return items;
  }, [stats, filter, debouncedQuery]);

  const counts = useMemo(
    () => ({
      all: stats?.items.length ?? 0,
      taken: stats?.items.filter((i) => i.status === 'Dispatched').length ?? 0,
      sold: stats?.items.filter((i) => i.status === 'Redeemed').length ?? 0,
    }),
    [stats]
  );

  const total = counts.all || 1;
  const soldPct = Math.round((counts.sold / total) * 100);

  return (
    <div className="space-y-5 pb-2">
      {/* ═══════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════ */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-violet-500">
            <ClipboardIcon size={13} />
            <p className="text-[10.5px] font-black uppercase tracking-[0.16em]">
              Inventory
            </p>
          </div>
          <h1 className="mt-1 text-[24px] font-black leading-tight tracking-[-0.025em] text-ink-900">
            My Stock List
          </h1>
        </div>
        <RefreshButton onRefresh={load} label="Refresh stock" />
      </div>

      {/* ═══════════════════════════════════════════════════
          STAT CARDS — refined
      ═══════════════════════════════════════════════════ */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard
          Icon={PackageIcon}
          label="Taken out"
          value={counts.all}
          tone="violet"
        />
        <StatCard
          Icon={CheckIcon}
          label="Sold"
          value={counts.sold}
          tone="green"
          hint={counts.all > 0 ? `${soldPct}%` : undefined}
        />
        <StatCard
          Icon={ClockIcon}
          label="Awaiting"
          value={counts.taken}
          tone={counts.taken > 0 ? 'amber' : 'slate'}
        />
      </div>

      {/* ═══════════════════════════════════════════════════
          SEARCH + FILTERS
      ═══════════════════════════════════════════════════ */}
      <div className="space-y-3">
        {/* Search */}
        <label className="flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3 shadow-[0_2px_4px_-2px_rgba(11,15,20,.04),0_8px_20px_-12px_rgba(11,15,20,.08)] ring-1 ring-ink-100/60 transition focus-within:ring-2 focus-within:ring-violet-500/40">
          <span className="text-ink-400">
            <SearchIcon size={16} />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by product or serial…"
            className="w-full border-0 bg-transparent text-[13.5px] font-semibold text-ink-900 outline-none placeholder:text-ink-300"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-ink-400 transition hover:text-ink-700"
              aria-label="Clear search"
            >
              <CloseIcon size={14} />
            </button>
          )}
        </label>

        {/* Filters */}
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {FILTERS.map((f) => {
            const isActive = filter === f.key;
            const count = counts[f.key];
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`group inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-[12px] font-black tracking-tight transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-[0_8px_20px_-10px_rgba(139,92,246,.95)]'
                    : 'bg-white text-ink-500 ring-1 ring-inset ring-ink-100/70 hover:bg-ink-50/70 hover:text-ink-900'
                }`}
              >
                {f.label}
                <span
                  className={`grid h-4 min-w-[18px] place-items-center rounded-md px-1 text-[10px] font-black transition ${
                    isActive
                      ? 'bg-white/25 text-white'
                      : 'bg-ink-100/70 text-ink-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          LIST
      ═══════════════════════════════════════════════════ */}
      {loading ? (
        <ListSkeleton count={5} lines={2} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={
            query ? (
              <SearchIcon size={28} className="text-violet-400" />
            ) : (
              <PackageIcon size={30} className="text-violet-400" />
            )
          }
          title={query ? 'No matches found' : 'No stock items yet'}
          hint={
            query
              ? 'Try a different search term or clear the filter.'
              : 'Scan products you take out for sale to populate this list.'
          }
          action={
            !query ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/staff/scan')}
              >
                <ScanIcon size={16} />
                <span className="ml-2">Scan products</span>
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-2.5">
          {visible.map((item) => (
            <StockCard key={item.serialNumber} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Stat card — premium
═══════════════════════════════════════════════════════════ */
function StatCard({
  Icon,
  label,
  value,
  tone,
  hint,
}: {
  Icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: number;
  tone: 'violet' | 'green' | 'amber' | 'slate';
  hint?: string;
}) {
  const toneMap: Record<
    typeof tone,
    { bg: string; fg: string; ring: string }
  > = {
    violet: {
      bg: 'bg-gradient-to-br from-violet-50 to-violet-100/60',
      fg: 'text-violet-600',
      ring: 'ring-violet-100',
    },
    green: {
      bg: 'bg-gradient-to-br from-brand-50 to-brand-100/60',
      fg: 'text-brand-700',
      ring: 'ring-brand-100',
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-50 to-amber-100/60',
      fg: 'text-amber-600',
      ring: 'ring-amber-100',
    },
    slate: {
      bg: 'bg-ink-100/60',
      fg: 'text-ink-400',
      ring: 'ring-ink-100',
    },
  };

  const t = toneMap[tone];

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-3.5 shadow-[0_2px_4px_-2px_rgba(11,15,20,.04),0_8px_20px_-12px_rgba(11,15,20,.08)] ring-1 ring-ink-100/60">
      <span
        className={`grid h-8 w-8 place-items-center rounded-xl ${t.bg} ${t.fg} ring-1 ring-inset ${t.ring}`}
      >
        <Icon size={15} />
      </span>

      <p className="mt-2.5 text-[9.5px] font-black uppercase tracking-wider text-ink-400">
        {label}
      </p>

      <div className="mt-0.5 flex items-baseline gap-1.5">
        <p className={`text-[22px] font-black tracking-tight ${t.fg}`}>
          {value}
        </p>
        {hint && (
          <span className="text-[10px] font-black text-ink-300">{hint}</span>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Stock card — refined
═══════════════════════════════════════════════════════════ */
function StockCard({ item }: { item: StaffStockItem }) {
  const isSold = item.status === 'Redeemed';

  return (
    <div className="group overflow-hidden rounded-2xl bg-white shadow-[0_2px_4px_-2px_rgba(11,15,20,.04),0_8px_20px_-12px_rgba(11,15,20,.08)] ring-1 ring-ink-100/60 transition hover:ring-ink-200">
      {/* Top half */}
      <div className="flex items-center gap-3.5 p-3.5">
        {/* Icon */}
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
          {isSold && (
            <span className="absolute -right-0.5 -top-0.5 grid h-4 w-4 place-items-center rounded-full bg-brand-500 text-[8px] font-black text-white ring-2 ring-white">
              ✓
            </span>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-bold tracking-[-0.005em] text-ink-900">
            {item.productTitle}
          </p>
          <p className="mt-0.5 truncate font-mono text-[10.5px] font-black tracking-wider text-ink-400">
            #{item.serialNumber}
          </p>
        </div>

        {/* Status */}
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

      {/* Timeline footer */}
      <div className="flex items-center gap-4 border-t border-ink-100/70 bg-ink-50/40 px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-ink-500">
          <ClockIcon size={11} />
          Taken {formatRelative(item.dispatchedAt)}
        </span>

        {isSold && item.redeemedAt && (
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-brand-700">
            <CheckIcon size={11} />
            Sold {formatRelative(item.redeemedAt)}
          </span>
        )}

        {!isSold && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-amber-700">
            Awaiting sale
          </span>
        )}
      </div>
    </div>
  );
}
