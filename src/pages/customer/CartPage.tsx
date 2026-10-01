import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { formatNaira } from '@/utils/format';
import { toast } from '@/hooks/useToast';
import type { CartItem } from '@/types';

export default function CartPage() {
  const navigate = useNavigate();
  const { items, loading, mutating, refresh, update, remove, clear } = useCart();
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  /* ─── Ensure cart is fresh ─────────────────────────────── */
  useEffect(() => {
    refresh();
  }, [refresh]);

  /* ─── Derived ──────────────────────────────────────────── */
  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0),
    [items]
  );
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  /* ─── Actions ──────────────────────────────────────────── */
  const handleQty = async (cartItemId: string, nextQty: number) => {
    if (nextQty < 1 || mutatingId) return;
    setMutatingId(cartItemId);
    try {
      await update(cartItemId, nextQty);
    } finally {
      setMutatingId(null);
    }
  };

  const handleRemove = async (cartItemId: string) => {
    if (mutatingId) return;
    setMutatingId(cartItemId);
    try {
      await remove(cartItemId);
      toast.success('Removed from cart');
    } finally {
      setMutatingId(null);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all items from your cart?')) return;
    try {
      await clear();
      toast.success('Cart cleared');
    } catch {}
  };

  /* ─── Loading ──────────────────────────────────────────── */
  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={28} className="!border-slate-300 !border-t-brand-500" />
      </div>
    );
  }

  /* ─── Empty cart ───────────────────────────────────────── */
  if (items.length === 0) {
    return (
      <EmptyState
        icon="🛒"
        title="Your cart is empty"
        hint="Browse our products and earn ₦100 cashback on every pack."
        action={
          <Button variant="primary" size="lg" onClick={() => navigate('/')}>
            Browse products
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-4 pb-2">
      {/* ═══════════════════════════════════════════════════
          HEADER
      ═══════════════════════════════════════════════════ */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-[24px] font-black tracking-[-0.03em] text-ink-900">
            Cart
          </h1>
          <p className="mt-0.5 text-[12px] font-semibold text-ink-400">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="rounded-lg px-2.5 py-1.5 text-[11.5px] font-black text-rose-600 transition hover:bg-rose-50 active:scale-95"
        >
          Clear all
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════
          ITEM LIST
      ═══════════════════════════════════════════════════ */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-100/60">
        {items.map((item, idx) => (
          <CartItemRow
            key={item.id}
            item={item}
            isLast={idx === items.length - 1}
            isMutating={mutatingId === item.id || mutating}
            onQtyChange={(q) => handleQty(item.id, q)}
            onRemove={() => handleRemove(item.id)}
            onTap={() => navigate(`/product/${item.product.slug || item.product.id}`)}
          />
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════
          SUBTOTAL + CHECKOUT
      ═══════════════════════════════════════════════════ */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-100/60">
        <div className="space-y-2.5 p-4">
          <SummaryRow
            label={`Subtotal (${itemCount} ${itemCount === 1 ? 'item' : 'items'})`}
            value={formatNaira(subtotal)}
          />
          <SummaryRow
            label="Delivery"
            value="Calculated at checkout"
            muted
          />

          <div className="border-t border-ink-100/70 pt-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[13px] font-black text-ink-900">Total</span>
              <span className="text-[20px] font-black tracking-[-0.02em] text-ink-900">
                {formatNaira(subtotal)}
              </span>
            </div>
            <p className="mt-1 text-[10.5px] font-semibold text-ink-400">
              You&apos;ll earn{' '}
              <b className="text-brand-700">{formatNaira(itemCount * 100)}</b>{' '}
              cashback from these packs
            </p>
          </div>
        </div>

        <div className="border-t border-ink-100/70 bg-ink-50/40 p-4">
          <Button
            variant="primary"
            size="lg"
            block
            onClick={() => navigate('/checkout')}
            className="shadow-[0_10px_24px_-10px_rgba(16,185,129,.85)]"
          >
            Proceed to checkout
            <svg viewBox="0 0 24 24" className="ml-1 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Button>

          <button
            type="button"
            onClick={() => navigate('/')}
            className="mt-2.5 w-full py-2 text-center text-[11.5px] font-black text-ink-400 transition hover:text-ink-700"
          >
            ← Continue shopping
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Cart Item Row
═══════════════════════════════════════════════════════════ */
function CartItemRow({
  item,
  isLast,
  isMutating,
  onQtyChange,
  onRemove,
  onTap,
}: {
  item: CartItem;
  isLast: boolean;
  isMutating: boolean;
  onQtyChange: (q: number) => void;
  onRemove: () => void;
  onTap: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3.5 ${
        !isLast ? 'border-b border-ink-100/70' : ''
      }`}
    >
      <button
        type="button"
        onClick={onTap}
        className="grid h-14 w-14 flex-shrink-0 place-items-center overflow-hidden rounded-xl bg-ink-50 ring-1 ring-ink-100/60 transition active:scale-95"
      >
        {item.product.thumbnailUrl ? (
          <img
            src={item.product.thumbnailUrl}
            alt={item.product.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              if (img.parentElement) {
                img.parentElement.classList.add('text-2xl');
                img.parentElement.textContent = '📦';
              }
            }}
          />
        ) : (
          <span className="text-2xl opacity-50">📦</span>
        )}
      </button>

      <button type="button" onClick={onTap} className="min-w-0 flex-1 text-left">
        <p className="line-clamp-1 text-[13px] font-bold text-ink-900">
          {item.product.title}
        </p>
        <p className="mt-0.5 text-[12px] font-black tracking-tight text-ink-900">
          {formatNaira(item.product.price)}
        </p>
        {item.quantity > 1 && (
          <p className="mt-0.5 text-[10.5px] font-semibold text-ink-400">
            {formatNaira(Number(item.product.price) * item.quantity)} total
          </p>
        )}
      </button>

      <div className="flex flex-shrink-0 items-center gap-1 rounded-full bg-ink-50 p-0.5 ring-1 ring-inset ring-ink-100/80">
        <button
          type="button"
          onClick={() => onQtyChange(item.quantity - 1)}
          disabled={isMutating}
          aria-label="Decrease quantity"
          className="grid h-7 w-7 place-items-center rounded-full text-[15px] font-black text-ink-700 transition active:scale-90 disabled:opacity-40"
        >
          −
        </button>
        <span className="min-w-[18px] text-center text-[12.5px] font-black text-ink-900">
          {isMutating ? (
            <span className="mx-auto block h-3 w-3 animate-spin rounded-full border-2 border-ink-300 border-t-ink-700" />
          ) : (
            item.quantity
          )}
        </span>
        <button
          type="button"
          onClick={() => onQtyChange(item.quantity + 1)}
          disabled={isMutating || item.quantity >= item.product.stockCount}
          aria-label="Increase quantity"
          className="grid h-7 w-7 place-items-center rounded-full text-[15px] font-black text-ink-700 transition active:scale-90 disabled:opacity-40"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={onRemove}
        disabled={isMutating}
        aria-label="Remove item"
        className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-ink-300 transition hover:bg-rose-50 hover:text-rose-500 active:scale-95 disabled:opacity-40"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Summary Row
═══════════════════════════════════════════════════════════ */
function SummaryRow({
  label,
  value,
  muted,
  accent,
}: {
  label: string;
  value: string;
  muted?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12.5px] font-semibold text-ink-400">{label}</span>
      <span
        className={`text-[12.5px] font-black ${
          accent ? 'text-brand-700' : muted ? 'text-ink-400' : 'text-ink-900'
        }`}
      >
        {value}
      </span>
    </div>
  );
}
