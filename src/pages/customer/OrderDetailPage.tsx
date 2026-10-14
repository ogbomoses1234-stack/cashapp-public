import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getOrder } from '@/services/order.service';
import type { Order } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { formatNaira, formatDateTime } from '@/utils/format';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError('Missing order ID');
      return;
    }
    let alive = true;
    setLoading(true);
    getOrder(id)
      .then((data) => {
        if (!alive) return;
        if (data && typeof data === 'object') setOrder(data);
        else setError('Order not found');
      })
      .catch((e) => alive && setError((e as { message?: string })?.message ?? 'Could not load this order'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={26} tone="brand" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <EmptyState
        icon="📦"
        title="Order not found"
        hint={error ?? 'This order may have been removed.'}
        action={<Button variant="primary" onClick={() => navigate('/orders')}>Back to orders</Button>}
      />
    );
  }

  const status = order.status ?? 'Processing';
  const isFlagged = status === 'Flagged';
  const items = Array.isArray(order.items) ? order.items : [];
  const tone =
    status === 'Delivered' ? 'green'
    : status === 'Shipped' ? 'blue'
    : status === 'Flagged' ? 'rose'
    : status === 'Cancelled' ? 'slate' : 'amber';

  return (
    <div className="pb-2 lg:grid lg:grid-cols-[1fr_360px] lg:gap-6">
      {/* ─── LEFT ─────────────────────────────────── */}
      <div className="space-y-4">
        {isFlagged && (
          <div className="overflow-hidden rounded-xl border border-rose-200 bg-rose-50/70">
            <div className="flex items-center gap-2.5 border-b border-rose-200/60 bg-rose-500/10 px-4 py-3">
              <span className="grid h-7 w-7 flex-shrink-0 place-items-center rounded-md bg-rose-500 text-white">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 9v4M12 17h.01" />
                  <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                </svg>
              </span>
              <div>
                <p className="text-[13px] font-semibold tracking-tight text-rose-900">
                  Order needs your attention
                </p>
                <p className="text-[11px] font-medium text-rose-700/80">
                  Our team couldn't verify your payment
                </p>
              </div>
            </div>
            <div className="space-y-3 p-4">
              <div>
                <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-wider text-rose-800">
                  Reason
                </p>
                <p className="rounded-lg bg-white/80 px-3.5 py-3 text-[13px] font-medium leading-relaxed text-rose-900 ring-1 ring-inset ring-rose-200">
                  {order.flagReason ?? 'No reason provided — contact support.'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="primary" size="md" onClick={() => navigate('/chat')} className="flex-1">
                  Contact support
                </Button>
                <Button variant="outline" size="md" onClick={() => navigate('/')} className="flex-1">
                  Browse products
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Order card */}
        <div className="rounded-xl bg-white p-5 ring-1 ring-ink-200/70">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <strong className="block truncate font-mono text-[14px] font-semibold text-ink-900">
                #{order.orderNumber}
              </strong>
              <small className="mt-1 block text-[11px] font-medium text-ink-400">
                Placed {formatDateTime(order.createdAt)}
              </small>
            </div>
            <Badge tone={tone}>{status}</Badge>
          </div>

          {items.length > 0 && (
            <div className="border-t border-ink-100 pt-3">
              {items.map((it) => (
                <div key={it.id} className="flex items-center justify-between py-2.5">
                  <div className="min-w-0">
                    <strong className="block truncate text-[13px] font-semibold text-ink-900">
                      {it.product?.title ?? 'Item'}
                    </strong>
                    <small className="text-[11px] font-medium text-ink-400">× {it.quantity}</small>
                  </div>
                  <span className="ml-3 whitespace-nowrap text-[13px] font-bold tabular-nums text-ink-900">
                    {formatNaira(it.unitPrice)}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-2 flex items-center justify-between border-t border-ink-100 pt-3">
            <span className="text-[13px] font-semibold text-ink-500">Total</span>
            <span className="text-[18px] font-bold tabular-nums tracking-[-0.02em] text-ink-900">
              {formatNaira(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>

      {/* ─── RIGHT: delivery + payment + help ──────── */}
      <aside className="mt-4 space-y-3 lg:mt-0">
        <div className="sticky top-20 space-y-3">
          <div className="rounded-xl bg-white p-4 ring-1 ring-ink-200/70">
            <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">
              Delivering to
            </p>
            <p className="mt-1.5 text-[13px] font-medium leading-relaxed text-ink-900">
              {order.deliveryAddress}
            </p>
          </div>

          <div className="rounded-xl bg-white p-4 ring-1 ring-ink-200/70">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-ink-400">
                  Payment
                </p>
                <p className="mt-1.5 text-[13px] font-medium text-ink-900">
                  {order.paymentMethod === 'bank_transfer' ? 'Bank Transfer' : 'Pay on Delivery'}
                </p>
              </div>
              {order.receiptObjectKey && (
                <span className="rounded-md bg-brand-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-700 ring-1 ring-inset ring-brand-200">
                  Receipt
                </span>
              )}
            </div>
          </div>

          {!isFlagged && (
            <div className="rounded-xl bg-white p-4 text-center ring-1 ring-ink-200/70">
              <p className="text-[12px] font-medium text-ink-500">
                Something wrong with this order?
              </p>
              <button
                onClick={() => navigate('/chat')}
                className="mt-2 text-[12.5px] font-semibold text-brand-600 transition-colors hover:text-brand-700"
              >
                Chat with support →
              </button>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}