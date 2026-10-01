import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ProductGrid } from '@/components/product/ProductGrid';
import { BannerCarousel } from '@/components/banner/BannerCarousel';
import { CategoryStrip } from '@/components/category/CategoryStrip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { listProducts } from '@/services/product.service';
import { listBanners, type Banner } from '@/services/banner.service';
import { listCategories, type Category } from '@/services/category.service';
import { getWallet } from '@/services/wallet.service';
import type { Product, WalletSummary } from '@/types';
import { formatNaira } from '@/utils/format';

/* ─── Time-aware greeting ────────────────────────────────── */
function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const HOME_PRODUCT_PREVIEW = 6;

export default function HomePage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [loading, setLoading] = useState(true);

  /* ─── Data loader ───────────────────────────────────────── */
  const load = useCallback(async () => {
    const results = await Promise.allSettled([
      listBanners(),
      listCategories(),
      listProducts({ perPage: HOME_PRODUCT_PREVIEW }),
      getWallet(),
    ]);

    const [b, c, p, w] = results;
    if (b.status === 'fulfilled') setBanners(b.value);
    if (c.status === 'fulfilled') setCategories(c.value);
    if (p.status === 'fulfilled')
      setProducts(Array.isArray(p.value) ? p.value : []);
    if (w.status === 'fulfilled') setWallet(w.value);
  }, []);

  /* ─── Initial load ──────────────────────────────────────── */
  useEffect(() => {
    let alive = true;
    setLoading(true);
    load().finally(() => {
      if (alive) setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [load]);

  /* ─── Pull-to-refresh (mobile) ──────────────────────────── */
  const { pulling, distance, refreshing } = usePullToRefresh({
    onRefresh: load,
  });

  const firstName = user?.fullName?.split(' ')[0] ?? 'there';
  const balance = wallet?.walletBalance ?? '0.00';

  return (
    <div className="space-y-5 pb-2">
      {/* ─── Pull-to-refresh indicator ─────────────────── */}
      <PullToRefresh
        pulling={pulling}
        distance={distance}
        refreshing={refreshing}
      />

      {/* ═══════════════════════════════════════════════════
          GREETING + BALANCE CHIP
      ═══════════════════════════════════════════════════ */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-ink-400">{greeting()}</p>
          <h1 className="mt-0.5 truncate text-[22px] font-black leading-tight tracking-[-0.02em] text-ink-900">
            {firstName}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => navigate('/wallet')}
          className="flex flex-shrink-0 items-center gap-2 rounded-xl bg-white px-3 py-2 shadow-card ring-1 ring-ink-100/60 transition active:scale-95"
        >
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500/12 text-brand-700">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
              <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4z" />
            </svg>
          </span>
          <div className="text-left leading-tight">
            <p className="text-[9.5px] font-bold uppercase tracking-wider text-ink-400">
              Balance
            </p>
            <p className="text-[12.5px] font-black tracking-tight text-ink-900">
              {formatNaira(balance)}
            </p>
          </div>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════
          BANNER CAROUSEL
      ═══════════════════════════════════════════════════ */}
      {banners.length > 0 && <BannerCarousel banners={banners} />}

      {/* ═══════════════════════════════════════════════════
          SEARCH
      ═══════════════════════════════════════════════════ */}
      <button
        type="button"
        onClick={() => navigate('/products')}
        className="flex w-full items-center gap-2.5 rounded-2xl bg-white px-4 py-3.5 text-left shadow-card ring-1 ring-ink-100/60 transition active:scale-[.99]"
      >
        <svg className="h-4 w-4 flex-shrink-0 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <span className="flex-1 text-[13.5px] font-semibold text-slate-400">
          Search products by name…
        </span>
        <svg viewBox="0 0 24 24" className="h-4 w-4 flex-shrink-0 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>

      {/* ═══════════════════════════════════════════════════
          CATEGORY STRIP
      ═══════════════════════════════════════════════════ */}
      {categories.length > 0 && (
        <CategoryStrip categories={categories} limit={6} showSeeAll />
      )}

      {/* ═══════════════════════════════════════════════════
          FEATURED PRODUCTS PREVIEW
      ═══════════════════════════════════════════════════ */}
      <section>
        <div className="mb-3.5 flex items-end justify-between">
          <h3 className="text-[15px] font-extrabold tracking-tight text-ink-900">
            Featured products
          </h3>
          <Link
            to="/products"
            className="text-[11.5px] font-black text-brand-700 hover:text-brand-800"
          >
            See all →
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : products.length === 0 ? (
          <EmptyState
            icon="📦"
            title="No products yet"
            hint="Check back soon — new packs are on the way."
          />
        ) : (
          <ProductGrid products={products} />
        )}
      </section>

      {/* ═══════════════════════════════════════════════════
          BOTTOM CTA
      ═══════════════════════════════════════════════════ */}
      <Link
        to="/products"
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 text-center text-[13px] font-black text-ink-900 shadow-card ring-1 ring-ink-100/60 transition active:scale-[.99]"
      >
        Browse all products
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand-700" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
