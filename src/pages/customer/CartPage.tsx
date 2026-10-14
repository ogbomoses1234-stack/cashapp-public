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

  useEffect(() => {
    refresh();
  }, [refresh]);

  const subtotal = useMemo(
    () => items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0),
    [items]
  );
  const itemCount = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items]
  );

  const handleQty = async (cartItemId: string, nextQty: number) => {
    if (nextQty < 1 || mutatingId) return;
    setMutatingId(cartItemId);
    try { await update(cartItemId, nextQty); } finally { setMutatingId(null); }
  };

  const handleRemove = async (cartItemId: string) => {
    if (mutatingId) return;
    setMutatingId(cartItemId);
    try { await remove(cartItemId); toast.success('Removed from cart'); }
    finally { setMutatingId(null); }
  };

  const handleClear = async () => {
    if (!window.confirm('Clear all items from your cart?')) return;
    try { await clear(); toast.success('Cart cleared'); } catch {}
  };

  if (loading && items.length === 0) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size={26} tone="brand" />
      </div>
    );
  }

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
    <div className="pb-2">
      {/* Header */}
      <div className="mb-5 flex items-end justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-[-0.02em] text-ink-900">Cart</h1>
          <p className="mt-0.5 text-[12.5px] font-medium text-ink-400">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </p>
        </div>
        <button
          onClick={handleClear}
          className="rounded-lg px-2.5 py-1.5 text-[11.5px] font-semibold text-rose-600 transition-colors hover:bg-rose-50"
        >
          Clear all
        </button>
      </div>

      {/* 2-col on desktop */}
      <div className="lg:grid lg:grid-cols-[1fr_380px] lg:gap-6">
        {/* ─── ITEMS ──────────────────────────────────── */}
        <div className="overflow-hidden rounded-xl bg-white ring-1 ring-ink-200/70">
          {items.map((item, idx) => (
            <CartRow
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

        {/* ─── SUMMARY ────────────────────────────────── */}
        <aside>
          <div className="sticky top-20 overflow-hidden rounded-xl bg-white ring-1 ring-ink-200/70 lg:overflow-visible">
            <div className="space-y-2.5 p-4">
              <Row label={`Subtotal (${itemCount})`} value={formatNaira(subtotal)} />
              <Row label="Delivery" value="At checkout" muted />

              <div className="border-t border-ink-100 pt-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-[13px] font-semibold text-ink-900">Total</span>
                  <span className="text-[20px] font-bold tracking-[-0.02em] tabular-nums text-ink-900">
                    {formatNaira(subtotal)}
                  </span>
                </div>
            <p className="mt-1 text-[10.5px] font-medium text-ink-400">
  Earn cashback on this order
</p>
              </div>
            </div>

            <div className="border-t border-ink-100 bg-ink-50/40 p-4">
              <Button variant="brand" size="lg" block onClick={() => navigate('/checkout')}>
                Proceed to checkout
                <svg viewBox="0 0 24 24" className="ml-1 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </Button>
              <button
                onClick={() => navigate('/')}
                className="mt-2.5 w-full py-2 text-center text-[11.5px] font-semibold text-ink-400 transition-colors hover:text-ink-700"
              >
                ← Continue shopping
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CartRow({
  item, isLast, isMutating, onQtyChange, onRemove, onTap,
}: {
  item: CartItem;
  isLast: boolean;
  isMutating: boolean;
  onQtyChange: (q: number) => void;
  onRemove: () => void;
  onTap: () => void;
}) {
  return (
    <div className={`flex items-center gap-3 p-3.5 ${!isLast ? 'border-b border-ink-100' : ''}`}>
      <button
        onClick={onTap}
        className="grid h-14 w-14 flex-shrink-0 place-items-center overflow-hidden rounded-lg bg-ink-50 ring-1 ring-ink-200/70 transition-transform active:scale-95"
      >
        {item.product.thumbnailUrl ? (
          <img src={item.product.thumbnailUrl} alt={item.product.title} className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl opacity-50">📦</span>
        )}
      </button>

      <button onClick={onTap} className="min-w-0 flex-1 text-left">
        <p className="line-clamp-1 text-[13px] font-semibold text-ink-900">
          {item.product.title}
        </p>
        <p className="mt-0.5 text-[12px] font-bold tabular-nums text-ink-900">
          {formatNaira(item.product.price)}
        </p>
        {item.quantity > 1 && (
          <p className="mt-0.5 text-[10.5px] font-medium text-ink-400">
            {formatNaira(Number(item.product.price) * item.quantity)} total
          </p>
        )}
      </button>

      <div className="flex flex-shrink-0 items-center gap-0.5 rounded-lg bg-ink-100 p-0.5 ring-1 ring-inset ring-ink-200/70">
        <button
          onClick={() => onQtyChange(item.quantity - 1)}
          disabled={isMutating}
          aria-label="Decrease"
          className="grid h-7 w-7 place-items-center rounded-md bg-white text-[14px] font-semibold text-ink-700 transition-colors hover:bg-ink-50 active:scale-90 disabled:opacity-40"
        >
          −
        </button>
        <span className="min-w-[18px] text-center text-[12.5px] font-semibold tabular-nums text-ink-900">
          {isMutating ? (
            <span className="mx-auto block h-3 w-3 animate-spin rounded-full border-2 border-ink-300 border-t-ink-700" />
          ) : item.quantity}
        </span>
        <button
          onClick={() => onQtyChange(item.quantity + 1)}
          disabled={isMutating || item.quantity >= item.product.stockCount}
          aria-label="Increase"
          className="grid h-7 w-7 place-items-center rounded-md bg-white text-[14px] font-semibold text-ink-700 transition-colors hover:bg-ink-50 active:scale-90 disabled:opacity-40"
        >
          +
        </button>
      </div>

      <button
        onClick={onRemove}
        disabled={isMutating}
        aria-label="Remove"
        className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-lg text-ink-300 transition-colors hover:bg-rose-50 hover:text-rose-500 disabled:opacity-40"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
      </button>
    </div>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12.5px] font-medium text-ink-400">{label}</span>
      <span className={`text-[12.5px] font-semibold tabular-nums ${muted ? 'text-ink-400' : 'text-ink-900'}`}>
        {value}
      </span>
    </div>
  );
}