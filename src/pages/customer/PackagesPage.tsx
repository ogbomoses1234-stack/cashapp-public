import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listMyPackages } from '@/services/package.service';
import type { PackageRequest, PackageStatus } from '@/types/package';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { RefreshButton } from '@/components/ui/RefreshButton';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { formatRelative } from '@/utils/format';
import { toast } from '@/hooks/useToast';
import { ApiClientError } from '@/services/api';

const STATUS_META: Record<PackageStatus, { label: string; tone: string }> = {
  draft:       { label: 'Draft',       tone: 'bg-ink-100    text-ink-600    ring-ink-200' },
  submitted:   { label: 'Submitted',   tone: 'bg-sky-50     text-sky-700    ring-sky-200' },
  quoted:      { label: 'Quoted',      tone: 'bg-violet-50  text-violet-700 ring-violet-200' },
  approved:    { label: 'Approved',    tone: 'bg-brand-50   text-brand-700  ring-brand-200' },
  in_progress: { label: 'In progress', tone: 'bg-amber-50   text-amber-700  ring-amber-200' },
  shipped:     { label: 'Shipped',     tone: 'bg-sky-50     text-sky-700    ring-sky-200' },
  delivered:   { label: 'Delivered',   tone: 'bg-brand-50   text-brand-700  ring-brand-200' },
  cancelled:   { label: 'Cancelled',   tone: 'bg-rose-50    text-rose-700   ring-rose-200' },
};

type Filter = 'all' | 'active' | 'closed';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'closed', label: 'Closed' },
];
const CLOSED: PackageStatus[] = ['delivered', 'cancelled'];

const POLL_INTERVAL_MS = 20_000;

export default function PackagesPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<PackageRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const mountedRef = useRef(true);

  const load = useCallback(async (opts: { silent?: boolean } = {}) => {
    if (!opts.silent) setLoading(true);
    try {
      const list = await listMyPackages();
      if (!mountedRef.current) return;
      setItems(list);
    } catch (e) {
      if (!mountedRef.current) return;
      setItems([]);
      const err = e as ApiClientError;
      if (!opts.silent && err.status !== 404 && err.status !== 0) {
        toast.error(err.message);
      }
    } finally {
      if (!opts.silent && mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => { mountedRef.current = false; };
  }, [load]);

  /* Poll for updates */
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      load({ silent: true }).catch(() => {});
    };
    const interval = setInterval(tick, POLL_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') load({ silent: true }).catch(() => {});
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  const visible = items.filter((p) => {
    if (filter === 'all') return true;
    if (filter === 'active') return !CLOSED.includes(p.status);
    return CLOSED.includes(p.status);
  });

  return (
    <div className="space-y-5 pb-2">
      {/* Header */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-violet-600">
            <span className="text-[13px]">🛍️</span>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em]">
              Personal shopping
            </p>
          </div>
          <h1 className="mt-1 text-[24px] font-bold leading-tight tracking-[-0.02em] text-ink-900">
            Special orders
          </h1>
          <p className="mt-1 text-[12.5px] font-medium text-ink-400">
            Send us a list — we source it and deliver to your door
          </p>
        </div>
        <RefreshButton onRefresh={() => load()} label="Refresh lists" />
      </div>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-600 via-violet-700 to-ink-950 p-5 text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full opacity-50"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,.35), transparent 65%)' }}
        />
        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
            No middleman. No inflated prices.
          </p>
          <h2 className="mt-1.5 text-[18px] font-bold leading-tight tracking-[-0.015em]">
            Tell us what you want — we handle the rest
          </h2>
          <p className="mt-2 max-w-md text-[12.5px] font-medium leading-relaxed text-white/80">
            Create a planned list, add reference photos, and chat directly with our
            team. We source from markets anywhere in Nigeria and deliver to your address
            — no hidden markups.
          </p>
          <Link
            to="/packages/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-[12.5px] font-semibold text-violet-700 shadow-sm transition-colors hover:bg-white/95 active:scale-95"
          >
            Start a new list
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Filters */}
      {items.length > 0 && (
        <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          {FILTERS.map((f) => {
            const isActive = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-[12px] font-semibold tracking-[-0.005em] transition-colors ${
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

      {/* List */}
      {loading ? (
        <ListSkeleton count={3} lines={3} />
      ) : items.length === 0 ? (
        <EmptyState
          icon="🛍️"
          title="No lists yet"
          hint="Create your first special-order list and our team will take it from there."
          action={
            <Button variant="primary" size="lg" onClick={() => navigate('/packages/new')}>
              Start a new list
            </Button>
          }
        />
      ) : visible.length === 0 ? (
        <EmptyState icon="🔍" title={`No ${filter} lists`} hint="Try a different filter." />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {visible.map((p) => (
            <PackageCard key={p.id} request={p} />
          ))}
        </div>
      )}
    </div>
  );
}

function PackageCard({ request }: { request: PackageRequest }) {
  const meta = STATUS_META[request.status] ?? STATUS_META.draft;
  const itemCount = request.items.length;
  const hasPendingEdit = request.pendingEditRequest?.status === 'pending';
  const hasQuote = !!request.quotedTotal;

  return (
    <Link
      to={`/packages/${request.id}`}
      className="group block overflow-hidden rounded-xl bg-white ring-1 ring-ink-200/70 transition-colors hover:ring-ink-300 active:scale-[.99]"
    >
      <div className="flex items-center gap-3 p-4">
        <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-xl bg-violet-50 text-xl">
          📦
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-1 text-[13.5px] font-semibold tracking-[-0.005em] text-ink-900">
              {request.title}
            </p>
            <span className={`flex-shrink-0 rounded-md px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider ring-1 ring-inset ${meta.tone}`}>
              {meta.label}
            </span>
          </div>
          <p className="mt-0.5 truncate font-mono text-[10.5px] font-semibold tracking-wider text-ink-400">
            #{request.reference}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[11px] font-medium text-ink-400">
            <span>{itemCount} {itemCount === 1 ? 'item' : 'items'}</span>
            {request.city && (
              <>
                <span className="h-1 w-1 rounded-full bg-ink-300" />
                <span className="truncate">
                  {request.city}
                  {request.country && `, ${request.country}`}
                </span>
              </>
            )}
          </div>
        </div>
        <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </div>

      {/* Footer strip */}
      {hasPendingEdit ? (
        <div className="border-t border-amber-100 bg-amber-50/70 px-4 py-2 text-[10.5px] font-semibold text-amber-800">
          ⏳ Edit request pending admin approval
        </div>
      ) : hasQuote ? (
        <div className="border-t border-brand-100 bg-brand-50/70 px-4 py-2 text-[10.5px] font-semibold text-brand-800">
          💰 Quote sent — check messages to confirm
        </div>
      ) : request.status === 'draft' ? (
        <div className="border-t border-ink-100 bg-ink-50/40 px-4 py-2 text-[10.5px] font-semibold text-ink-600">
          ✎ Draft — continue editing and submit when ready
        </div>
      ) : request.lastMessageAt ? (
        <div className="border-t border-ink-100 bg-ink-50/40 px-4 py-2 text-[10.5px] font-medium text-ink-400">
          Last activity {formatRelative(request.lastMessageAt)}
        </div>
      ) : null}
    </Link>
  );
}