import { useEffect, useMemo, useState } from 'react';
import { Watermark } from '@/components/brand/Watermark';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getProduct, listProducts } from '@/services/product.service';
import type { Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { formatNaira } from '@/utils/format';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from '@/hooks/useToast';
import { ApiClientError } from '@/services/api';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const openAuthModal = useUIStore((s) => s.openAuthModal);

  /* Real cart state */
  const { items, add, update, mutating } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [qty, setQty] = useState(1); // only used when item is NOT in cart
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  /* ─── Load product + related ───────────────────────────── */
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    getProduct(slug)
      .then((p) => {
        setProduct(p);
        setQty(1);
        return listProducts({ category: p.category ?? undefined, perPage: 8 });
      })
      .then((list) => {
        setRelated(
          (Array.isArray(list) ? list : [])
            .filter((p) => p.slug !== slug)
            .slice(0, 6)
        );
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  /* ─── Cart state for THIS product ──────────────────────── */
  const cartItem = useMemo(
    () => items.find((i) => i.productId === product?.id),
    [items, product?.id]
  );
  const inCart = !!cartItem;
  const cartQty = cartItem?.quantity ?? 0;

  /* The quantity the UI displays:
   *  - If in cart → real cart quantity
   *  - If not → the local "how many to add" value */
  const displayQty = inCart ? cartQty : qty;

  /* ─── Loading / not found ──────────────────────────────── */
  if (loading) {
    return (
      <div className="space-y-4">
      <Watermark />
        <div className="aspect-square w-full animate-pulse rounded-3xl bg-white/70" />
        <div className="h-6 w-2/3 animate-pulse rounded-lg bg-white/70" />
        <div className="h-6 w-1/3 animate-pulse rounded-lg bg-white/70" />
      </div>
    );
  }

  if (!product) {
    return (
      <EmptyState
        icon="🔍"
        title="Product not found"
        hint="It may have been removed or the link is broken."
        action={
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to store
          </Button>
        }
      />
    );
  }

  const inStock = product.stockCount > 0;
  const maxQty = product.stockCount;

  /* ─── Auth helper ──────────────────────────────────────── */
  const requireAuth = (): boolean => {
    if (!user) {
      openAuthModal('Create an account or log in to start shopping.');
      return false;
    }
    if (user.role === 'staff') {
      openAuthModal('Seller accounts cannot place customer orders.');
      return false;
    }
    return true;
  };

  /* ─── Increment ────────────────────────────────────────── */
  const handleIncrement = async () => {
    if (mutating) return;
    if (displayQty >= maxQty) return;

    if (inCart && cartItem) {
      /* Already in cart → update the real cart quantity */
      try {
        await update(cartItem.id, cartQty + 1);
      } catch {}
    } else {
      /* Not in cart → just bump local qty */
      setQty((q) => Math.min(maxQty, q + 1));
    }
  };

  /* ─── Decrement ────────────────────────────────────────── */
  const handleDecrement = async () => {
    if (mutating) return;

    if (inCart && cartItem) {
      if (cartQty <= 1) {
        /* Removing the last unit → confirm then remove */
        if (!window.confirm(`Remove "${product.title}" from cart?`)) return;
        try {
          await update(cartItem.id, 0);
        } catch {}
      } else {
        try {
          await update(cartItem.id, cartQty - 1);
        } catch {}
      }
    } else {
      setQty((q) => Math.max(1, q - 1));
    }
  };

  /* ─── Add to cart ──────────────────────────────────────── */
  const handleAdd = async () => {
    if (!requireAuth() || !inStock) return;
    setAdding(true);
    try {
      await add(product.id, qty);
      setQty(1);
      toast.success(`Added ${qty} to cart`);
    } catch (e) {
      toast.error((e as ApiClientError).message);
    } finally {
      setAdding(false);
    }
  };

  /* ─── Buy now ──────────────────────────────────────────── */
  const handleBuyNow = async () => {
    if (!requireAuth() || !inStock) return;
    setAdding(true);
    try {
      if (inCart) {
        /* Already in cart — just go to checkout */
        navigate('/cart');
      } else {
        await add(product.id, qty);
        setQty(1);
        navigate('/cart');
      }
    } catch (e) {
      toast.error((e as ApiClientError).message);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="space-y-6 pb-40">
      {/* ═══════════════════════════════════════════════════════
          PRODUCT IMAGE
      ═══════════════════════════════════════════════════════ */}
      <section className="relative -mx-4 mt-2">
        <div className="relative aspect-square w-full overflow-hidden bg-ink-50">
          {product.thumbnailUrl ? (
            <img
              src={product.thumbnailUrl}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-brand-50 to-brand-100">
              <span className="text-[100px] opacity-60">🧴</span>
            </div>
          )}

          <span className="absolute left-4 top-4 rounded-lg bg-ink-900/90 px-2.5 py-1.5 text-[10px] font-black tracking-wider text-brand-300 backdrop-blur">
            ● QR SEAL
          </span>

          {!inStock && (
            <span className="absolute right-4 top-4 rounded-lg bg-rose-500 px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider text-white">
              Sold out
            </span>
          )}

          {/* In-cart overlay badge */}
          {inCart && (
            <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-brand-500 px-3 py-1.5 text-[11px] font-black text-[#04140d] shadow-[0_8px_20px_-6px_rgba(16,185,129,.8)]">
              <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="m5 12 5 5 9-11" />
              </svg>
              {cartQty} in cart
            </span>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PRICE + TITLE
      ═══════════════════════════════════════════════════════ */}
      <section>
        <div className="flex items-baseline gap-3">
          <span className="text-[28px] font-black leading-none tracking-[-0.03em] text-ink-900">
            {formatNaira(product.price)}
          </span>
          {Number(product.price) > 100 && (
            <>
              <span className="text-[15px] font-bold text-ink-400 line-through decoration-ink-300">
                {formatNaira(Number(product.price) + 100)}
              </span>
              <span className="rounded-lg bg-rose-500/10 px-2 py-1 text-[10.5px] font-black uppercase tracking-wider text-rose-600">
                Save ₦100
              </span>
            </>
          )}
        </div>

        <div className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-500/10 px-2.5 py-1.5 ring-1 ring-inset ring-brand-500/20">
          <span className="grid h-4 w-4 place-items-center rounded-full bg-brand-500 text-[9px] font-black text-[#04140d]">
            ₦
          </span>
          <span className="text-[11.5px] font-black text-brand-800">
            You&apos;ll earn ₦100 cashback on this pack
          </span>
        </div>

        <h1 className="mt-4 text-[24px] font-black leading-tight tracking-[-0.03em] text-ink-900">
          {product.title}
        </h1>

        <div className="mt-2 flex items-center gap-3">
          {product.category && (
            <Link
              to={`/categories/${product.category.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-[11.5px] font-bold uppercase tracking-wider text-ink-400 transition hover:text-brand-700"
            >
              {product.category}
            </Link>
          )}
          <span className="h-3 w-px bg-ink-200" />
          <div className="flex items-center gap-1">
            <span className="text-[13px] text-amber-500">★</span>
            <span className="text-[12px] font-black text-ink-900">4.6</span>
            <span className="text-[11.5px] font-semibold text-ink-400">(1.3k)</span>
          </div>
        </div>

        <p className="mt-4 text-[13.5px] font-medium leading-[1.6] text-ink-500">
          {product.description ??
            'Premium quality product with instant ₦100 cashback on every sealed QR pack.'}
        </p>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TRUST BADGES
      ═══════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-3 gap-2.5">
        <TrustBadge
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 17h14M5 17v-6h9l4 4v2" />
              <circle cx="7.5" cy="17.5" r="1.5" />
              <circle cx="17" cy="17.5" r="1.5" />
            </svg>
          }
          label="Fast delivery"
          sub="2–5 days"
        />
        <TrustBadge
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          }
          label="Secure pay"
          sub="Bank verified"
        />
        <TrustBadge
          icon={
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <path d="M3 3v6h6" />
            </svg>
          }
          label="Easy returns"
          sub="Within 7 days"
        />
      </section>

      {/* ═══════════════════════════════════════════════════════
          QUANTITY — bound to real cart state when in cart
      ═══════════════════════════════════════════════════════ */}
      <section className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-card ring-1 ring-ink-100/60">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-black tracking-tight text-ink-900">
              Quantity
            </p>
            {inCart && (
              <span className="rounded-md bg-brand-500/12 px-1.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-brand-700">
                In cart
              </span>
            )}
          </div>
          <p className="mt-0.5 text-[11px] font-semibold text-ink-400">
            {inStock
              ? `${product.stockCount} in stock`
              : 'Currently out of stock'}
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-ink-50 p-1 ring-1 ring-inset ring-ink-100/80">
          <button
            type="button"
            onClick={handleDecrement}
            disabled={mutating || (!inCart && displayQty <= 1)}
            aria-label={inCart && cartQty === 1 ? 'Remove from cart' : 'Decrease quantity'}
            className="grid h-8 w-8 place-items-center rounded-lg text-[16px] font-black text-ink-700 transition active:scale-90 disabled:opacity-30"
          >
            {inCart && cartQty === 1 ? (
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18" />
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                <path d="M19 6 18 20a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
            ) : (
              '−'
            )}
          </button>

          <span className="min-w-[28px] text-center text-[14px] font-black text-ink-900">
            {mutating ? (
              <span className="mx-auto block h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink-300 border-t-ink-700" />
            ) : (
              displayQty
            )}
          </span>

          <button
            type="button"
            onClick={handleIncrement}
            disabled={mutating || displayQty >= maxQty}
            aria-label="Increase quantity"
            className="grid h-8 w-8 place-items-center rounded-lg text-[16px] font-black text-ink-700 transition active:scale-90 disabled:opacity-30"
          >
            +
          </button>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          RELATED PRODUCTS
      ═══════════════════════════════════════════════════════ */}
      {related.length > 0 && (
        <section className="pt-2">
          <div className="mb-3 flex items-end justify-between">
            <h3 className="text-[15px] font-extrabold tracking-tight text-ink-900">
              You might also like
            </h3>
            <Link
              to="/"
              className="text-[11.5px] font-black text-brand-700 hover:text-brand-800"
            >
              See all →
            </Link>
          </div>
          <ProductGrid products={related} />
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════
          STICKY BOTTOM ACTION BAR
      ═══════════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-ink-100/80 bg-white/95 px-4 pb-4 pt-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3">
          {/* Left: total — reflects real cart quantity */}
          <div className="hidden sm:block">
            <p className="text-[10.5px] font-bold uppercase tracking-wider text-ink-400">
              {inCart ? 'In cart' : 'Total'}
            </p>
            <p className="text-[18px] font-black tracking-[-0.02em] text-ink-900">
              {formatNaira(Number(product.price) * displayQty)}
            </p>
          </div>

          {/* Right: actions */}
          <div className="flex flex-1 gap-2.5">
            {inCart ? (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/cart')}
                  className="flex-1"
                >
                  View cart
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={adding || mutating}
                  className="flex-1"
                >
                  Checkout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleAdd}
                  disabled={adding || mutating || !inStock}
                  className="flex-1"
                >
                  Add to cart
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={adding || mutating || !inStock}
                  className="flex-1"
                >
                  Buy now
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   Trust Badge
═══════════════════════════════════════════════════════════ */
function TrustBadge({
  icon,
  label,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white p-3 text-center shadow-card ring-1 ring-ink-100/60">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-500/10 text-brand-700">
        {icon}
      </span>
      <p className="mt-2 text-[11px] font-black tracking-tight text-ink-900">
        {label}
      </p>
      <p className="mt-0.5 text-[10px] font-semibold text-ink-400">{sub}</p>
    </div>
  );
}
