import { useNavigate } from 'react-router-dom';
import type { Product } from '@/types';
import { formatNaira } from '@/utils/format';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { useCart } from '@/hooks/useCart';

const TINTS = [
  'from-emerald-50 to-emerald-100/40',
  'from-violet-50  to-violet-100/40',
  'from-amber-50   to-amber-100/40',
  'from-rose-50    to-rose-100/40',
  'from-sky-50     to-sky-100/40',
  'from-indigo-50  to-indigo-100/40',
];

const ICONS = ['🧴', '🧼', '🧖', '🎁', '🥛', '🌸'];

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const openAuthModal = useUIStore((s) => s.openAuthModal);
  const { items, add, update, mutating } = useCart();

  const tint = TINTS[index % TINTS.length];
  const emoji = ICONS[index % ICONS.length];
  const inStock = product.stockCount > 0;

  const cartItem = items.find((i) => i.productId === product.id);
  const inCart = !!cartItem;
  const quantity = cartItem?.quantity ?? 0;

  const openDetail = () => navigate(`/product/${product.slug || product.id}`);

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
      className="
        group relative flex cursor-pointer flex-col overflow-hidden
        rounded-xl bg-white ring-1 ring-ink-200/70
        transition-shadow duration-200
        hover:ring-ink-300 hover:shadow-md hover:shadow-ink-950/[.03]
        active:scale-[.99]
      "
    >
      <div
        className={`relative m-2 mb-0 grid aspect-[5/4] place-items-center overflow-hidden rounded-lg bg-gradient-to-br ${tint}`}
      >
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <span className="text-[44px] drop-shadow-sm">{emoji}</span>
        )}

        <span
          className={`absolute left-2 top-2 h-1.5 w-1.5 rounded-full ${
            inStock ? 'bg-brand-500' : 'bg-rose-500'
          } ring-[2.5px] ring-white`}
          aria-label={inStock ? 'In stock' : 'Out of stock'}
        />

        {inCart && (
          <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-ink-900 ring-1 ring-inset ring-ink-200 backdrop-blur-sm">
            <svg
              viewBox="0 0 24 24"
              className="h-2.5 w-2.5 text-brand-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m5 12 5 5 9-11" />
            </svg>
            {quantity} in cart
          </span>
        )}

        {!inStock && (
          <span className="absolute inset-0 grid place-items-center bg-white/70 text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-500 backdrop-blur-[1px]">
            Sold out
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-3">
        <h5 className="line-clamp-2 text-[13px] font-semibold leading-snug tracking-[-0.005em] text-ink-900">
          {product.title}
        </h5>

        <p className="mb-2.5 mt-1 line-clamp-2 text-[11.5px] font-medium leading-relaxed text-ink-400">
          {product.description ?? 'Instant cashback on every sealed pack.'}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="text-[15px] font-bold tracking-[-0.01em] tabular-nums text-ink-900">
            {formatNaira(product.price)}
          </div>

          {inCart ? (
            <div
              className="flex items-center gap-0.5 rounded-lg bg-ink-100 p-0.5 ring-1 ring-inset ring-ink-200/70"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={quantity === 1 ? handleRemove : handleDecrement}
                disabled={mutating}
                aria-label={quantity === 1 ? 'Remove from cart' : 'Decrease'}
                className="grid h-7 w-7 place-items-center rounded-md bg-white text-[14px] font-semibold text-ink-700 shadow-sm transition-colors duration-150 hover:bg-ink-50 active:scale-90 disabled:opacity-50"
              >
                {quantity === 1 ? (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3 w-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 6h18" />
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  </svg>
                ) : (
                  '−'
                )}
              </button>

              <span className="min-w-[20px] text-center text-[12px] font-semibold tabular-nums text-ink-900">
                {quantity}
              </span>

              <button
                type="button"
                onClick={handleIncrement}
                disabled={mutating || quantity >= product.stockCount}
                aria-label="Increase"
                className="grid h-7 w-7 place-items-center rounded-md bg-white text-[14px] font-semibold text-ink-700 shadow-sm transition-colors duration-150 hover:bg-ink-50 active:scale-90 disabled:opacity-50"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={mutating || !inStock}
              className="
                inline-flex h-8 items-center gap-1 rounded-lg bg-ink-900 px-3
                text-[11.5px] font-semibold text-white
                transition-colors duration-150
                hover:bg-ink-800 active:scale-[.97]
                disabled:cursor-not-allowed disabled:bg-ink-300
              "
              aria-label={`Add ${product.title} to cart`}
            >
              Add
              <svg
                viewBox="0 0 24 24"
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}