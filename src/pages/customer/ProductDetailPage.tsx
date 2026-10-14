import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { PublicShell } from '@/layouts/PublicShell';
import { getProduct, listProducts } from '@/services/product.service';
import type { Product } from '@/types';
import { useCart } from '@/hooks/useCart';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { formatNaira } from '@/utils/format';
import { ProductGrid } from '@/components/product/ProductGrid';
import { QuantityStepper } from '@/components/product/QuantityStepper';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from '@/hooks/useToast';
import { ApiClientError } from '@/services/api';

/* Fail-safe — never let the page hang forever */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(
      () => reject(new Error(`Request timed out after ${ms}ms`)),
      ms
    );
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (e) => {
        clearTimeout(t);
        reject(e);
      }
    );
  });
}

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const openAuthModal = useUIStore((s) => s.openAuthModal);
  const { items, add, update, mutating } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  /* ─── Load product ───────────────────────────────── */
  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setErrorMessage('No product specified');
      return;
    }

    let alive = true;
    setLoading(true);
    setErrorMessage(null);
    setProduct(null);
    setRelated([]);
    setQty(1);

    withTimeout(getProduct(slug), 6000)
      .then((p) => {
        if (!alive) return;
        if (!p || typeof p !== 'object') {
          setErrorMessage('This product could not be found.');
          return;
        }
        setProduct(p);

        withTimeout(
          listProducts({ category: p.category ?? undefined, perPage: 8 }),
          6000
        )
          .then((list) => {
            if (!alive) return;
            setRelated(
              (Array.isArray(list) ? list : [])
                .filter((x) => x.slug !== slug)
                .slice(0, 6)
            );
          })
          .catch(() => {});
      })
      .catch((err) => {
        if (!alive) return;
        const msg =
          err instanceof Error
            ? err.message
            : typeof err === 'string'
              ? err
              : 'Could not load product';
        setErrorMessage(msg);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [slug]);

  /* ─── Cart state for this product ─────────────────── */
  const cartItem = useMemo(
    () => items.find((i) => i.productId === product?.id),
    [items, product?.id]
  );
  const inCart = !!cartItem;
  const cartQty = cartItem?.quantity ?? 0;
  const displayQty = inCart ? cartQty : qty;

  /* ─── Loading ─────────────────────────────────────── */
  if (loading) {
    return (
      <PublicShell>
        <div className="flex flex-col items-center justify-center gap-3 py-24">
          <Spinner size={28} tone="brand" />
          <p className="text-[12px] font-medium text-ink-400">Loading product…</p>
        </div>
      </PublicShell>
    );
  }

  /* ─── Error ───────────────────────────────────────── */
  if (errorMessage || !product) {
    return (
      <PublicShell>
        <EmptyState
          icon="⚠️"
          title="Could not load product"
          hint={errorMessage ?? 'Please try again.'}
          action={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/products')}>
                Back to products
              </Button>
              <Button variant="primary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          }
        />
      </PublicShell>
    );
  }

  const inStock = product.stockCount > 0;
  const maxQty = product.stockCount;

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

  const handleBuyNow = async () => {
    if (!requireAuth() || !inStock) return;
    setAdding(true);
    try {
      if (inCart) navigate('/cart');
      else {
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

  /* ═══════════════════════════════════════════════════
     BUY BOX — shared between mobile bottom bar + desktop rail
  ═══════════════════════════════════════════════════ */
  const BuyBox = (
    <div className="space-y-4">
      <div>
        <div className="flex items-baseline gap-2.5">
          <span className="text-[26px] font-bold leading-none tracking-[-0.02em] tabular-nums text-ink-900">
            {formatNaira(product.price)}
          </span>
        </div>
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-2 py-1 ring-1 ring-inset ring-brand-200">
          <span className="grid h-3.5 w-3.5 place-items-center rounded-full bg-brand-500 text-[8px] font-bold text-white">
            ₦
          </span>
          <span className="text-[11px] font-semibold text-brand-700">Earn cashback</span>
        </div>
      </div>

      <h1 className="text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink-900">
        {product.title}
      </h1>

      <div className="flex items-center gap-3 text-[11.5px] font-medium">
        {product.category && (
          <Link
            to={`/categories/${product.category.toLowerCase().replace(/\s+/g, '-')}`}
            className="uppercase tracking-wider text-ink-500 transition-colors hover:text-brand-600"
          >
            {product.category}
          </Link>
        )}
        <span className="h-3 w-px bg-ink-200" />
        <div className="flex items-center gap-1">
          <span className="text-[12px] text-amber-500">★</span>
          <span className="font-semibold text-ink-900">4.6</span>
          <span className="text-ink-400">(1.3k)</span>
        </div>
      </div>

      <p className="text-[13.5px] font-medium leading-[1.65] text-ink-500">
        {product.description ?? 'Premium quality with instant cashback on every sealed pack.'}
      </p>

      <div className="flex items-center justify-between rounded-lg bg-ink-50 p-3 ring-1 ring-inset ring-ink-200/70">
        <div>
          <p className="text-[12.5px] font-semibold text-ink-900">Quantity</p>
          <p className="mt-0.5 text-[11px] font-medium text-ink-400">
            {inStock ? `${product.stockCount} in stock` : 'Out of stock'}
          </p>
        </div>
        <QuantityStepper
          value={displayQty}
          max={maxQty}
          min={1}
          size="sm"
          disabled={mutating}
          onChange={(v) => {
            if (inCart && cartItem) update(cartItem.id, v);
            else setQty(v);
          }}
        />
      </div>

      {/* Buy/add buttons — desktop rail only */}
      <div className="hidden space-y-2 lg:block">
        {inCart ? (
          <>
            <Button variant="brand" size="lg" block onClick={handleBuyNow} disabled={adding || mutating}>
              Checkout now
            </Button>
            <Button variant="outline" size="lg" block onClick={() => navigate('/cart')}>
              View cart
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="brand"
              size="lg"
              block
              onClick={handleBuyNow}
              disabled={adding || mutating || !inStock}
            >
              Buy now
            </Button>
            <Button
              variant="outline"
              size="lg"
              block
              onClick={handleAdd}
              disabled={adding || mutating || !inStock}
            >
              Add to cart
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <PublicShell>
      <div className="pb-32 lg:pb-8">
        <div className="lg:grid lg:grid-cols-[1fr_400px] lg:gap-8">
          <div className="min-w-0 space-y-5">
            <div className="relative -mx-4 overflow-hidden rounded-xl bg-ink-50 ring-1 ring-ink-200/70 lg:mx-0">
              <div className="relative aspect-square w-full overflow-hidden lg:aspect-[5/4]">
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
                <span className="absolute left-3 top-3 rounded-md bg-ink-950/85 px-2 py-1 text-[10px] font-semibold tracking-wider text-brand-300 backdrop-blur-sm">
                  ● QR SEAL
                </span>
                {!inStock && (
                  <span className="absolute right-3 top-3 rounded-md bg-rose-500 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                    Sold out
                  </span>
                )}
              </div>
            </div>

            {/* Mobile: full BuyBox below the image */}
            <div className="lg:hidden">{BuyBox}</div>

            <div className="hidden grid-cols-3 gap-2.5 lg:grid">
              <Trust icon="🚚" label="Fast delivery" sub="2–5 days" />
              <Trust icon="🔒" label="Secure pay" sub="Bank verified" />
              <Trust icon="↩️" label="Easy returns" sub="Within 7 days" />
            </div>

            {related.length > 0 && (
              <section className="pt-2">
                <div className="mb-3 flex items-end justify-between">
                  <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink-900">
                    You might also like
                  </h3>
                  <Link to="/products" className="text-[12px] font-semibold text-brand-600 hover:text-brand-700">
                    See all →
                  </Link>
                </div>
                <ProductGrid products={related} columns={2} />
              </section>
            )}
          </div>

          <aside className="hidden lg:block">
            <div className="sticky top-20">{BuyBox}</div>
          </aside>
        </div>

        {/* Mobile sticky footer bar */}
        <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-ink-200 bg-white/95 px-4 py-3 backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-ink-400">
                {inCart ? 'In cart' : 'Total'}
              </p>
              <p className="text-[16px] font-bold tabular-nums text-ink-900">
                {formatNaira(Number(product.price) * displayQty)}
              </p>
            </div>
            {inCart ? (
              <Button variant="brand" size="md" onClick={handleBuyNow} className="px-5">
                Checkout
              </Button>
            ) : (
              <>
                <Button variant="outline" size="md" onClick={handleAdd} disabled={!inStock}>
                  Add
                </Button>
                <Button variant="brand" size="md" onClick={handleBuyNow} disabled={!inStock}>
                  Buy
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </PublicShell>
  );
}

function Trust({ icon, label, sub }: { icon: string; label: string; sub: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl bg-white p-3 text-center ring-1 ring-ink-200/70">
      <span className="text-base">{icon}</span>
      <p className="mt-1.5 text-[11.5px] font-semibold tracking-tight text-ink-900">{label}</p>
      <p className="mt-0.5 text-[10px] font-medium text-ink-400">{sub}</p>
    </div>
  );
}