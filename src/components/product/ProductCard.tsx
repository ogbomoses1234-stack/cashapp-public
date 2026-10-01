import { useNavigate } from 'react-router-dom';
import type { Product } from '@/types';
import { formatNaira } from '@/utils/format';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useCart } from '@/hooks/useCart';

/* Soft modern tints — never saturated */
const TINTS = [
  'from-emerald-50 to-emerald-100/40',
  'from-violet-50  to-violet-100/40',
  'from-amber-50   to-amber-100/40',
  'from-rose-50    to-rose-100/40',
  'from-sky-50     to-sky-100/40',
  'from-indigo-50  to-indigo-100/40',
];

const ICONS = ['🧴', '🧼', '🧖', '🎁', '🥛', '🌸'];

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const openAuthModal = useUIStore((s) => s.openAuthModal);
  const { items, add, update, mutating } = useCart();

  const tint = TINTS[index % TINTS.length];
  const emoji = ICONS[index % ICONS.length];
  const inStock = product.stockCount > 0;

  /* ─── Find the cart item (if any) ─────────────────────── */
  const cartItem = items.find((i) => i.productId === product.id);
  const inCart = !!cartItem;
  const quantity = cartItem?.quantity ?? 0;

  const openDetail = () => navigate(`/product/${product.slug || product.id}`);

  /* ─── Add first unit ───────────────────────────────────── */
  const handleAdd = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      openAuthModal('Create an account or log in to start shopping.');
      return;
    }
    if (user.role === 'staff') {
      openAuthModal('Seller accounts cannot place customer orders.');
      return;
    }
    if (!inStock) return;

    try {
      await add(product.id, 1);
    } catch {}
  };

  /* ─── Increment / decrement ────────────────────────────── */
  const handleIncrement = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!cartItem || mutating) return;
    try {
      await update(cartItem.id, quantity + 1);
    } catch {}
  };

  const handleDecrement = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!cartItem || mutating || quantity <= 1) return;
    try {
      await update(cartItem.id, quantity - 1);
    } catch {}
  };

  /* ─── Remove when qty hits 0 ───────────────────────────── */
  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!cartItem || mutating) return;
    try {
      await update(cartItem.id, 0);
    } catch {}
  };

  return (
    <article
      onClick={openDetail}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink-100/60 transition active:scale-[.985]"
    >
      {/* ─── Image block ─────────────────────────────────── */}
      <div className={`relative m-2.5 mb-0 grid h-36 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br ${tint}`}>
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <span className="text-[56px] drop-shadow-sm">{emoji}</span>
        )}

        {/* Stock dot */}
        <span
          className={`absolute left-2.5 top-2.5 h-2 w-2 rounded-full ${
            inStock ? 'bg-brand-500' : 'bg-rose-500'
          } shadow-[0_0_0_3px_rgba(255,255,255,.9)]`}
          aria-label={inStock ? 'In stock' : 'Out of stock'}
        />

        {/* QR whisper tag */}
        <span className="absolute right-2.5 top-2.5 rounded-md bg-ink-900/85 px-1.5 py-0.5 text-[8.5px] font-black tracking-wider text-brand-300 backdrop-blur">
          QR
        </span>

        {/* In-cart quantity badge — top-left overlay on the image */}
        {inCart && (
          <span className="absolute bottom-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-brand-500 px-2 py-1 text-[10px] font-black text-[#04140d] shadow-[0_4px_12px_-4px_rgba(16,185,129,.8)]">
            <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="m5 12 5 5 9-11" />
            </svg>
            {quantity} in cart
          </span>
        )}

        {!inStock && (
          <span className="absolute inset-0 grid place-items-center bg-white/65 text-[10.5px] font-black uppercase tracking-widest text-ink-400 backdrop-blur-[1px]">
            Sold out
          </span>
        )}
      </div>

      {/* ─── Body ────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3">
        <h5 className="line-clamp-2 text-[13.5px] font-extrabold leading-snug tracking-tight text-ink-900">
          {product.title}
        </h5>

        <p className="mb-3 mt-1 line-clamp-2 text-[11.5px] font-medium leading-relaxed text-ink-400">
          {product.description ?? 'Instant ₦100 cashback on every sealed pack.'}
        </p>

        {/* ─── Price + action ────────────────────────────── */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="leading-none">
            <div className="text-[15px] font-black tracking-tight text-ink-900">
              {formatNaira(product.price)}
            </div>
          </div>

          {inCart ? (
            /* ─── Quantity stepper ──────────────────────── */
            <div
              className="flex items-center gap-1 rounded-full bg-brand-50 p-1 ring-1 ring-inset ring-brand-500/25"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={quantity === 1 ? handleRemove : handleDecrement}
                disabled={mutating}
                aria-label={quantity === 1 ? 'Remove from cart' : 'Decrease quantity'}
                className="grid h-7 w-7 place-items-center rounded-full bg-white text-[14px] font-black text-brand-700 shadow-[0_1px_2px_rgba(11,15,20,.06)] transition active:scale-90 disabled:opacity-50"
              >
                {quantity === 1 ? (
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                ) : (
                  '−'
                )}
              </button>

              <span className="min-w-[20px] text-center text-[12.5px] font-black text-brand-800">
                {quantity}
              </span>

              <button
                type="button"
                onClick={handleIncrement}
                disabled={mutating || quantity >= product.stockCount}
                aria-label="Increase quantity"
                className="grid h-7 w-7 place-items-center rounded-full bg-white text-[14px] font-black text-brand-700 shadow-[0_1px_2px_rgba(11,15,20,.06)] transition active:scale-90 disabled:opacity-50"
              >
                +
              </button>
            </div>
          ) : (
            /* ─── Add button ────────────────────────────── */
            <button
              onClick={handleAdd}
              disabled={mutating || !inStock}
              className="inline-flex items-center gap-1.5 rounded-full bg-ink-900 px-3.5 py-2 text-[11.5px] font-black text-white shadow-btn transition active:scale-95 disabled:opacity-40"
              aria-label={`Add ${product.title} to cart`}
            >
              Add
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
