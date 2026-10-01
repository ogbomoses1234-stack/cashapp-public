import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listOrders } from '@/services/order.service';
import type { Order, OrderStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { formatNaira, formatDate } from '@/utils/format';
import { toast } from '@/hooks/useToast';
import { ListSkeleton } from '@/components/ui/Skeleton';

/* ═══════════════════════════════════════════════════════════
   Filters + status metadata
═══════════════════════════════════════════════════════════ */
const FILTERS: Array<{ key: 'all' | OrderStatus; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'Processing', label: 'Processing' },
  { key: 'Shipped', label: 'Shipped' },
  { key: 'Delivered', label: 'Delivered' },
];

const STATUS_META: Record<
  OrderStatus,
  { tone: 'amber' | 'blue' | 'green' | 'rose' | 'slate'; step: number }
> = {
  Processing: { tone: 'amber', step: 1 },
  Shipped: { tone: 'blue', step: 2 },
  Delivered: { tone: 'green', step: 3 },
  Flagged: { tone: 'rose', step: 1 },
  Cancelled: { tone: 'slate', step: 0 },
};

const STEPS = ['Placed', 'Packed', 'Shipped', 'Delivered'];

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');

  useEffect(() => {
    let alive = true;
    listOrders()
      .then((list) => alive && setOrders(Array.isArray(list) ? list : []))
      .catch(() => alive && setOrders([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const visible = useMemo(
    () => (filter === 'all' ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  );

  const counts = useMemo(
    () => ({
      all: orders.length,
      Processing: orders.filter((o) => o.status === 'Processing').length,
      Shipped: orders.filter((o) => o.status === 'Shipped').length,
      Delivered: orders.filter((o) => o.status === 'Delivered').length,
    }),
    [orders]
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-[26px] font-black tracking-[-0.03em] text-ink-900">
          My Orders
        </h1>
        <ListSkeleton count={4} lines={3} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-[26px] font-black tracking-[-0.03em] text-ink-900">
          My Orders
        </h1>
        <EmptyState
          icon="📦"
          title="No orders yet"
          hint="Browse our products and earn ₦100 cashback on every pack."
          action={
            <Button variant="primary" size="lg" onClick={() => navigate('/')}>
              Browse products
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-2">
      {/* Header */}
      <div>
        <h1 className="text-[26px] font-black tracking-[-0.03em] text-ink-900">
          My Orders
        </h1>
        <p className="mt-1 text-[12.5px] font-medium text-ink-400">
          Track your purchases and cashback rewards
        </p>
      </div>

      {/* Filter tabs */}
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {FILTERS.map((f) => {
          const isActive = filter === f.key;
          const n = (counts as Record<string, number>)[f.key] ?? 0;
          return (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-[12px] font-black tracking-tight transition ${
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

      {/* List */}
      {visible.length === 0 ? (
        <EmptyState
          icon="🔍"
          title={`No ${filter.toLowerCase()} orders`}
          hint="Try a different filter to see your orders."
        />
      ) : (
        <div className="space-y-3">
          {visible.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Order Card
═══════════════════════════════════════════════════════════ */
function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate();

  /* Defensive reads */
  const status = order?.status ?? 'Processing';
  const items = Array.isArray(order?.items) ? order.items : [];
  const meta = STATUS_META[status] ?? STATUS_META.Processing;
  const itemCount = items.reduce((s, i) => s + (i.quantity ?? 0), 0);
  const previewItems = items.slice(0, 3);

  const copyOrderNumber = () => {
    navigator.clipboard?.writeText(order.orderNumber);
    toast.success('Order number copied');
  };

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-100/60">
      {/* Header: order # + status */}
      <div className="flex items-center justify-between border-b border-ink-100/70 px-4 py-3">
        <button
          type="button"
          onClick={copyOrderNumber}
          className="flex items-center gap-1.5 text-left transition active:opacity-60"
        >
          <span className="font-mono text-[12.5px] font-black tracking-tight text-ink-900">
            #{order.orderNumber}
          </span>
          <svg
            viewBox="0 0 24 24"
            className="h-3 w-3 text-ink-300"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        <Badge tone={meta.tone}>{status}</Badge>
      </div>

      {/* ═══════════════════════════════════════════════════
          FLAGGED REASON PREVIEW — only when flagged
      ═══════════════════════════════════════════════════ */}
      {status === 'Flagged' && (
        <div className="flex items-start gap-2 border-b border-rose-100/70 bg-rose-50/70 px-4 py-2.5">
          <svg
            viewBox="0 0 24 24"
            className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-rose-500"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 9v4M12 17h.01" />
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          </svg>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-wider text-rose-700">
              Needs your attention
            </p>
            <p className="mt-0.5 line-clamp-2 text-[11.5px] font-semibold leading-snug text-rose-900">
              {order.flagReason ?? 'Contact support for details.'}
            </p>
          </div>
        </div>
      )}

      {/* Progress timeline (hidden for Flagged/Cancelled) */}
      {status !== 'Cancelled' && status !== 'Flagged' && (
        <div className="px-4 pt-4">
          <ProgressTimeline currentStep={meta.step} />
        </div>
      )}

      {/* Items preview */}
      <div className="flex items-center gap-3 p-4">
        {/* Thumbnail stack */}
        <div className="flex items-center">
          {previewItems.map((item, idx) => (
            <div
              key={item.id}
              className="grid h-12 w-12 place-items-center overflow-hidden rounded-xl bg-ink-50 ring-2 ring-white"
              style={{ marginLeft: idx === 0 ? 0 : -12, zIndex: 10 - idx }}
            >
              {item.product?.thumbnailUrl ? (
                <img
                  src={item.product.thumbnailUrl}
                  alt={item.product.title}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    if (img.parentElement) {
                      img.parentElement.classList.add('text-lg');
                      img.parentElement.textContent = '📦';
                    }
                  }}
                />
              ) : (
                <span className="text-lg opacity-50">📦</span>
              )}
            </div>
          ))}
          {itemCount > previewItems.length && (
            <div
              className="grid h-12 w-12 place-items-center rounded-xl bg-ink-100 text-[11px] font-black text-ink-500 ring-2 ring-white"
              style={{ marginLeft: -12, zIndex: 5 }}
            >
              +{itemCount - previewItems.length}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-bold text-ink-900">
            {previewItems[0]?.product?.title ?? 'Order'}
            {items.length > 1 && (
              <span className="text-ink-400"> and {items.length - 1} more</span>
            )}
          </p>
          <p className="mt-0.5 text-[11px] font-semibold text-ink-400">
            {formatDate(order.createdAt)} · {itemCount}{' '}
            {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {/* Footer: total + CTAs */}
      <div className="flex items-center justify-between border-t border-ink-100/70 bg-ink-50/40 px-4 py-3">
        <div>
          <p className="text-[10.5px] font-bold uppercase tracking-wider text-ink-400">
            Total
          </p>
          <p className="mt-0.5 text-[15px] font-black tracking-[-0.02em] text-ink-900">
            {formatNaira(order.totalAmount)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/orders/${order.id}`)}
          >
            View details
          </Button>
          {status === 'Flagged' && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => navigate('/chat')}
            >
              Get help
            </Button>
          )}
          {status === 'Delivered' && (
            <Button variant="primary" size="sm" onClick={() => navigate('/')}>
              Reorder
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Progress Timeline
═══════════════════════════════════════════════════════════ */
function ProgressTimeline({ currentStep }: { currentStep: number }) {
  return (
    <div className="relative">
      <div className="absolute left-[10px] right-[10px] top-[5px] h-0.5 bg-ink-100" />
      <div
        className="absolute left-[10px] top-[5px] h-0.5 bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-500"
        style={{
          width: `calc(${(currentStep / (STEPS.length - 1)) * 100}% - 20px)`,
        }}
      />
      <div className="relative flex justify-between">
        {STEPS.map((step, idx) => {
          const reached = idx <= currentStep;
          return (
            <div key={step} className="flex flex-col items-center gap-1.5">
              <div
                className={`grid h-[22px] w-[22px] place-items-center rounded-full border-2 transition ${
                  reached
                    ? 'border-brand-500 bg-brand-500'
                    : 'border-ink-200 bg-white'
                }`}
              >
                {reached ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-2.5 w-2.5 text-white"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m5 12 5 5 9-11" />
                  </svg>
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-ink-300" />
                )}
              </div>
              <span
                className={`text-[9.5px] font-black uppercase tracking-wider ${
                  reached ? 'text-ink-900' : 'text-ink-400'
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
