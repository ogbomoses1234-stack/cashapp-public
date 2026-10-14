import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listOrders } from '@/services/order.service';
import type { Order, OrderStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { ListSkeleton } from '@/components/ui/Skeleton';
import { formatNaira, formatDate } from '@/utils/format';
import { toast } from '@/hooks/useToast';

const FILTERS: Array<{ key: 'all' | OrderStatus; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'Processing', label: 'Processing' },
  { key: 'Shipped', label: 'Shipped' },
  { key: 'Delivered', label: 'Delivered' },
];

const STATUS_TONE: Record<OrderStatus, 'amber' | 'blue' | 'green' | 'rose' | 'slate'> = {
  Processing: 'amber',
  Shipped: 'blue',
  Delivered: 'green',
  Flagged: 'rose',
  Cancelled: 'slate',
};

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
    return () => { alive = false; };
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
        <h1 className="text-[24px] font-bold tracking-[-0.02em] text-ink-900">Orders</h1>
        <ListSkeleton count={4} lines={3} />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-[24px] font-bold tracking-[-0.02em] text-ink-900">Orders</h1>
        <EmptyState
  icon="📦"
  title="No orders yet"
  hint="Browse our products and earn cashback on every pack."
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
      <div>
        <h1 className="text-[24px] font-bold tracking-[-0.02em] text-ink-900">Orders</h1>
        <p className="mt-1 text-[12.5px] font-medium text-ink-400">
          Track purchases and cashback rewards
        </p>
      </div>

      {/* Filter chips */}
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        {FILTERS.map((f) => {
          const isActive = filter === f.key;
          const n = (counts as Record<string, number>)[f.key] ?? 0;
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
              {n > 0 && (
                <span className={`ml-1.5 ${isActive ? 'text-brand-300' : 'text-ink-400'}`}>
                  {n}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <EmptyState icon="🔍" title={`No ${filter.toLowerCase()} orders`} hint="Try a different filter." />
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

function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate();
  const status = order?.status ?? 'Processing';
  const items = Array.isArray(order?.items) ? order.items : [];
  const tone = STATUS_TONE[status] ?? 'slate';
  const itemCount = items.reduce((s, i) => s + (i.quantity ?? 0), 0);
  const preview = items.slice(0, 3);

  const copyNumber = () => {
    navigator.clipboard?.writeText(order.orderNumber);
    toast.success('Order number copied');
  };

  return (
    <div className="overflow-hidden rounded-xl bg-white ring-1 ring-ink-200/70">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
        <button onClick={copyNumber} className="flex items-center gap-1.5 text-left transition-opacity active:opacity-60">
          <span className="font-mono text-[12.5px] font-semibold tracking-tight text-ink-900">
            #{order.orderNumber}
          </span>
          <svg viewBox="0 0 24 24" className="h-3 w-3 text-ink-300" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        </button>
        <Badge tone={tone}>{status}</Badge>
      </div>

      {/* Flag alert */}
      {status === 'Flagged' && (
        <div className="border-b border-rose-100 bg-rose-50/70 px-4 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
            Needs attention
          </p>
          <p className="mt-0.5 line-clamp-2 text-[11.5px] font-medium leading-snug text-rose-900">
            {order.flagReason ?? 'Contact support for details.'}
          </p>
        </div>
      )}

      {/* Items preview */}
      <div className="flex items-center gap-3 p-4">
        <div className="flex items-center">
          {preview.map((item, idx) => (
            <div
              key={item.id}
              className="grid h-12 w-12 place-items-center overflow-hidden rounded-lg bg-ink-50 ring-2 ring-white"
              style={{ marginLeft: idx === 0 ? 0 : -10, zIndex: 10 - idx }}
            >
              {item.product?.thumbnailUrl ? (
                <img src={item.product.thumbnailUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="text-lg opacity-50">📦</span>
              )}
            </div>
          ))}
          {itemCount > preview.length && (
            <div
              className="grid h-12 w-12 place-items-center rounded-lg bg-ink-100 text-[11px] font-bold text-ink-500 ring-2 ring-white"
              style={{ marginLeft: -10, zIndex: 5 }}
            >
              +{itemCount - preview.length}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-semibold text-ink-900">
            {preview[0]?.product?.title ?? 'Order'}
            {items.length > 1 && <span className="font-medium text-ink-400"> and {items.length - 1} more</span>}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-ink-400">
            {formatDate(order.createdAt)} · {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-ink-100 bg-ink-50/40 px-4 py-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">Total</p>
          <p className="mt-0.5 text-[15px] font-bold tabular-nums tracking-[-0.02em] text-ink-900">
            {formatNaira(order.totalAmount)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/orders/${order.id}`)}>
            View details
          </Button>
          {status === 'Flagged' && (
            <Button variant="danger" size="sm" onClick={() => navigate('/chat')}>
              Get help
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}