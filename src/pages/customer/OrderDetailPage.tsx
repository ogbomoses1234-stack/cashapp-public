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
    setError(null);
    getOrder(id)
      .then((data) => {
        if (!alive) return;
        if (data && typeof data === 'object') setOrder(data);
        else setError('Order not found');
      })
      .catch((e) => {
        if (!alive) return;
        setError((e as { message?: string })?.message ?? 'Could not load this order');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={28} className="!border-slate-300 !border-t-brand-500" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <EmptyState
        icon="📦"
        title="Order not found"
        hint={error ?? 'This order may have been removed or the link is broken.'}
        action={
          <Button variant="primary" onClick={() => navigate('/orders')}>
            Back to orders
          </Button>
        }
      />
    );
  }

  /* ─── Defensive reads ─────────────────────────────────── */
  const status = order.status ?? 'Processing';
  const isFlagged = status === 'Flagged';
  const flagReason = order.flagReason ?? null;
  const flaggedAt = order.flaggedAt ?? null;
  const items = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="space-y-4 pb-2">
      {/* ═══════════════════════════════════════════════════
          FLAG ALERT — prominent, explains why
      ═══════════════════════════════════════════════════ */}
      {isFlagged && (
        <div className="overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100/60 shadow-card">
          {/* Header */}
          <div className="flex items-center gap-2.5 border-b border-rose-200/60 bg-rose-500/10 px-4 py-3">
            <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-xl bg-rose-500 text-white shadow-[0_4px_12px_-4px_rgba(244,63,94,.7)]">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v4M12 17h.01" />
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </span>
            <div className="min-w-0">
              <p className="text-[13px] font-black tracking-tight text-rose-900">
                Order needs your attention
              </p>
              <p className="text-[11px] font-semibold text-rose-700/80">
                Our team couldn&apos;t verify your payment
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-3.5 p-4">
            {/* Reason box */}
            <div>
              <p className="mb-1.5 text-[10.5px] font-black uppercase tracking-wider text-rose-800">
                Reason from our team
              </p>
              <div className="rounded-xl bg-white/70 px-3.5 py-3 ring-1 ring-inset ring-rose-200">
                <p className="text-[13px] font-medium leading-relaxed text-rose-900">
                  {flagReason ?? 'No reason provided — contact support for details.'}
                </p>
              </div>
            </div>

            {/* Next steps */}
            <div>
              <p className="mb-1.5 text-[10.5px] font-black uppercase tracking-wider text-rose-800">
                What you can do
              </p>
              <ul className="space-y-1.5">
                <Bullet>Double-check your bank transfer receipt</Bullet>
                <Bullet>Make sure the amount matches exactly</Bullet>
                <Bullet>Contact support if you believe this is a mistake</Bullet>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex gap-2.5 pt-1">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/chat')}
                className="flex-1"
              >
                Contact support
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Browse products
              </Button>
            </div>

            {flaggedAt && (
              <p className="text-center text-[10.5px] font-semibold text-rose-700/60">
                Flagged on {formatDateTime(flaggedAt)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          ORDER CARD
      ═══════════════════════════════════════════════════ */}
      <div className="rounded-3xl bg-white p-5 shadow-card ring-1 ring-ink-100/60">
        {/* Header */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <strong className="block truncate font-mono text-[14px] font-black text-ink-900">
              #{order.orderNumber}
            </strong>
            <small className="mt-1 block text-[11px] font-semibold text-ink-400">
              Placed {formatDateTime(order.createdAt)}
            </small>
          </div>
          <Badge
            tone={
              status === 'Delivered'
                ? 'green'
                : status === 'Shipped'
                  ? 'blue'
                  : status === 'Flagged'
                    ? 'rose'
                    : status === 'Cancelled'
                      ? 'slate'
                      : 'amber'
            }
          >
            {status}
          </Badge>
        </div>

        {/* Items */}
        {items.length > 0 && (
          <div className="border-t border-ink-100/70 pt-3">
            {items.map((it) => (
              <div key={it.id} className="flex items-center justify-between py-2.5">
                <div className="min-w-0">
                  <strong className="block truncate text-[13px] font-bold text-ink-900">
                    {it.product?.title ?? 'Item'}
                  </strong>
                  <small className="text-[11px] font-semibold text-ink-400">
                    × {it.quantity}
                  </small>
                </div>
                <span className="ml-3 whitespace-nowrap text-[13px] font-black tracking-tight text-ink-900">
                  {formatNaira(it.unitPrice)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Total */}
        <div className="mt-2 flex items-center justify-between border-t border-ink-100/70 pt-3">
          <span className="text-[13px] font-bold text-ink-500">Total</span>
          <span className="text-[18px] font-black tracking-tight text-ink-900">
            {formatNaira(order.totalAmount)}
          </span>
        </div>

        {/* Delivery */}
        <div className="mt-3 rounded-2xl bg-ink-50/70 p-3.5">
          <p className="text-[10.5px] font-black uppercase tracking-wider text-ink-500">
            Delivery to
          </p>
          <p className="mt-1 text-[12.5px] font-semibold text-ink-900">
            {order.deliveryAddress}
          </p>
        </div>

        {/* Payment */}
        <div className="mt-3 rounded-2xl bg-ink-50/70 p-3.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10.5px] font-black uppercase tracking-wider text-ink-500">
                Payment method
              </p>
              <p className="mt-1 text-[12.5px] font-semibold text-ink-900">
                {order.paymentMethod === 'bank_transfer'
                  ? 'Bank Transfer'
                  : 'Pay on Delivery'}
              </p>
            </div>
            {order.receiptObjectKey && (
              <span className="rounded-lg bg-brand-500/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-brand-700">
                Receipt attached
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════
          HELP FOOTER
      ═══════════════════════════════════════════════════ */}
      {!isFlagged && (
        <div className="rounded-2xl bg-white p-4 text-center shadow-card ring-1 ring-ink-100/60">
          <p className="text-[12px] font-medium text-ink-500">
            Something wrong with this order?
          </p>
          <button
            type="button"
            onClick={() => navigate('/chat')}
            className="mt-2 text-[12.5px] font-black text-brand-700 hover:text-brand-800"
          >
            Chat with support →
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Bullet helper
═══════════════════════════════════════════════════════════ */
function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 grid h-1.5 w-1.5 flex-shrink-0 rounded-full bg-rose-400" />
      <span className="text-[12.5px] font-medium leading-relaxed text-rose-900/90">
        {children}
      </span>
    </li>
  );
}
