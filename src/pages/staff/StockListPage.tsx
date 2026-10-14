import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyStock } from '@/services/staff.service';
import type { StaffStockStats, StaffStockItem } from '@/services/staff.service';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { ListSkeleton } from '@/components/ui/Skeleton';
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
    try { setStats(await getMyStock()); }
    catch { setStats(null); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const visible = useMemo(() => {
    let items = stats?.items ?? [];
    if (filter === 'taken') items = items.filter((i) => i.status === 'Dispatched');
    if (filter === 'sold') items = items.filter((i) => i.status === 'Redeemed');
    if (debouncedQuery.trim()) {
      const q = debouncedQuery.toLowerCase();
      items = items.filter(
        (i) => i.productTitle.toLowerCase().includes(q) || i.serialNumber.toLowerCase().includes(q)
      );
    }
    return items;
  }, [stats, filter, debouncedQuery]);

  const counts = useMemo(() => ({
    all: stats?.items.length ?? 0,
    taken: stats?.items.filter((i) => i.status === 'Dispatched').length ?? 0,
    sold: stats?.items.filter((i) => i.status === 'Redeemed').length ?? 0,
  }), [stats]);

  return (
    <div className="space-y-5 pb-2">
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-violet-600">
            <span className="text-[13px]">📋</span>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]">Inventory</p>
          </div>
          <h1 className="mt-1 text-[24px] font-bold leading-tight tracking-[-0.02em] text-ink-900">
            My Stock List
          </h1>
        </div>
        <RefreshButton onRefresh={load} label="Refresh stock" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard label="Taken out" value={counts.all} tone="violet" />
        <StatCard label="Sold" value={counts.sold} tone="green" />
        <StatCard label="Awaiting" value={counts.taken} tone={counts.taken > 0 ? 'amber' : 'slate'} />
      </div>

      {/* Search */}
      <label className="flex items-center gap-2.5 rounded-xl bg-white px-4 py-3 ring-1 ring-ink-200/70 transition-shadow focus-within:ring-2 focus-within:ring-violet-500/40">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-ink-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by product or serial…"
          className="w-full border-0 bg-transparent text-[13.5px] font-medium text-ink-900 outline-none placeholder:text-ink-400"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            aria-label="Clear"
            className="grid h-6 w-6 place-items-center rounded-md text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-700"
          >
            ✕
          </button>
        )}
      </label>

      {/* Filters */}
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        {FILTERS.map((f) => {
          const isActive = filter === f.key;
          const count = counts[f.key];
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3.5 py-2 text-[12px] font-semibold tracking-[-0.005em] transition-colors ${
                isActive
                  ? 'bg-gradient-to-br from-violet-500 to-violet-700 text-white shadow-sm shadow-violet-500/30'
                  : 'bg-white text-ink-500 ring-1 ring-inset ring-ink-200 hover:bg-ink-50 hover:text-ink-900'
              }`}
            >
              {f.label}
              <span
                className={`grid h-4 min-w-[18px] place-items-center rounded px-1 text-[10px] font-bold tabular-nums ${
                  isActive ? 'bg-white/25 text-white' : 'bg-ink-100 text-ink-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <ListSkeleton count={5} lines={2} />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={query ? '🔍' : '📦'}
          title={query ? 'No matches found' : 'No stock items yet'}
          hint={
            query
              ? 'Try a different search term.'
              : 'Scan products you take out for sale to populate this list.'
          }
          action={
            !query ? (
              <Button variant="primary" size="lg" onClick={() => navigate('/staff/scan')}>
                Scan products
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-2.5 lg:grid-cols-2">
          {visible.map((item) => <StockCard key={item.serialNumber} item={item} />)}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label, value, tone,
}: {
  label: string;
  value: number;
  tone: 'violet' | 'green' | 'amber' | 'slate';
}) {
  const map = {
    violet: { bg: 'bg-violet-50', fg: 'text-violet-600', ring: 'ring-violet-100' },
    green: { bg: 'bg-brand-50', fg: 'text-brand-700', ring: 'ring-brand-100' },
    amber: { bg: 'bg-amber-50', fg: 'text-amber-600', ring: 'ring-amber-100' },
    slate: { bg: 'bg-ink-100', fg: 'text-ink-400', ring: 'ring-ink-100' },
  }[tone];

  return (
    <div className="overflow-hidden rounded-xl bg-white p-3.5 ring-1 ring-ink-200/70">
      <span className={`grid h-8 w-8 place-items-center rounded-lg ${map.bg} ${map.fg} ring-1 ring-inset ${map.ring}`}>
        <span className="text-[12px]">•</span>
      </span>
      <p className="mt-2.5 text-[9.5px] font-bold uppercase tracking-wider text-ink-400">
        {label}
      </p>
      <p className={`mt-0.5 text-[22px] font-bold tabular-nums tracking-[-0.02em] ${map.fg}`}>
        {value}
      </p>
    </div>
  );
}

function StockCard({ item }: { item: StaffStockItem }) {
  const isSold = item.status === 'Redeemed';
  return (
    <div className="group overflow-hidden rounded-xl bg-white ring-1 ring-ink-200/70 transition-colors hover:ring-ink-300">
      <div className="flex items-center gap-3.5 p-3.5">
        <div
          className={`relative grid h-11 w-11 flex-shrink-0 place-items-center overflow-hidden rounded-lg ${
            isSold
              ? 'bg-gradient-to-br from-brand-50 to-brand-100/60 text-brand-600'
              : 'bg-gradient-to-br from-violet-50 to-violet-100/60 text-violet-600'
          }`}
        >
          <span className="text-[18px]">{isSold ? '✓' : '📦'}</span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold tracking-[-0.005em] text-ink-900">
            {item.productTitle}
          </p>
          <p className="mt-0.5 truncate font-mono text-[10.5px] font-semibold tracking-wider text-ink-400">
            #{item.serialNumber}
          </p>
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

      <div className="flex items-center gap-4 border-t border-ink-100 bg-ink-50/40 px-4 py-2.5">
        <span className="text-[10.5px] font-medium text-ink-500">
          Taken {formatRelative(item.dispatchedAt)}
        </span>
        {isSold && item.redeemedAt && (
          <span className="text-[10.5px] font-medium text-brand-700">
            Sold {formatRelative(item.redeemedAt)}
          </span>
        )}
        {!isSold && (
          <span className="ml-auto rounded-md bg-amber-50 px-2 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-amber-700">
            Awaiting sale
          </span>
        )}
      </div>
    </div>
  );
}