import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { ProductGrid } from '@/components/product/ProductGrid';
import { BannerCarousel } from '@/components/banner/BannerCarousel';
import { CategoryStrip } from '@/components/category/CategoryStrip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { PullToRefresh } from '@/components/ui/PullToRefresh';
import { SearchBar } from '@/components/layout/SearchBar';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { listProducts } from '@/services/product.service';
import { listBanners, type Banner } from '@/services/banner.service';
import { listCategories, type Category } from '@/services/category.service';
import { listMyPackages } from '@/services/package.service';
import { getWallet } from '@/services/wallet.service';
import type { Product, WalletSummary } from '@/types';
import type { PackageRequest } from '@/types/package';
import { formatNaira } from '@/utils/format';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

const HOME_PRODUCT_PREVIEW = 8;

export default function HomePage() {
  const user = useAuthStore((s) => s.user);

  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [activePackage, setActivePackage] = useState<PackageRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const results = await Promise.allSettled([
      listBanners(),
      listCategories(),
      listProducts({ perPage: HOME_PRODUCT_PREVIEW }),
      getWallet(),
      listMyPackages(),
    ]);
    const [b, c, p, w, pk] = results;
    if (b.status === 'fulfilled') setBanners(b.value);
    if (c.status === 'fulfilled') setCategories(c.value);
    if (p.status === 'fulfilled') setProducts(Array.isArray(p.value) ? p.value : []);
    if (w.status === 'fulfilled') setWallet(w.value);
    if (pk.status === 'fulfilled') {
      const active = pk.value.find(
        (r) => !['delivered', 'cancelled', 'draft'].includes(r.status)
      );
      setActivePackage(active ?? null);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    load().finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [load]);

  const { pulling, distance, refreshing } = usePullToRefresh({ onRefresh: load });

  const firstName = user?.fullName?.split(' ')[0] ?? 'there';
  const balance = wallet?.walletBalance ?? '0.00';

  return (
    <div className="pb-2">
      <PullToRefresh pulling={pulling} distance={distance} refreshing={refreshing} />

      <div className="lg:grid lg:grid-cols-[1fr_320px] lg:gap-8">
        {/* MAIN COLUMN */}
        <div className="min-w-0 space-y-5">
          {/* Mobile greeting row */}
          <div className="flex items-end justify-between gap-3 lg:hidden">
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-ink-400">{greeting()}</p>
              <h1 className="mt-0.5 truncate text-[22px] font-bold leading-tight tracking-[-0.02em] text-ink-900">
                {firstName}
              </h1>
            </div>
            <Link
              to="/wallet"
              className="flex flex-shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-2 ring-1 ring-ink-200/70 transition-colors hover:bg-ink-50"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md bg-brand-50 text-brand-600">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="6" width="20" height="14" rx="3" />
                  <path d="M2 10h20" />
                </svg>
              </span>
              <div className="text-left leading-tight">
                <p className="text-[9.5px] font-semibold uppercase tracking-wider text-ink-400">
                  Balance
                </p>
                <p className="text-[12.5px] font-bold tabular-nums text-ink-900">
                  {formatNaira(balance)}
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop greeting */}
          <div className="hidden lg:block">
            <p className="text-[13px] font-medium text-ink-400">{greeting()},</p>
            <h1 className="mt-0.5 text-[24px] font-bold tracking-[-0.02em] text-ink-900">
              {firstName}
            </h1>
          </div>

          {banners.length > 0 && <BannerCarousel banners={banners} />}

          <SearchBar to="/products" />

          {categories.length > 0 && (
            <CategoryStrip categories={categories} limit={6} showSeeAll />
          )}

          <section>
            <div className="mb-3.5 flex items-end justify-between">
              <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink-900">
                Featured products
              </h3>
              <Link
                to="/products"
                className="text-[12px] font-semibold text-brand-600 transition-colors hover:text-brand-700"
              >
                See all →
              </Link>
            </div>
            {loading ? (
              <ProductGridSkeleton count={6} />
            ) : products.length === 0 ? (
              <EmptyState icon="📦" title="No products yet" hint="Check back soon." />
            ) : (
              <ProductGrid products={products} columns={2} />
            )}
          </section>

          <Link
            to="/products"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-3.5 text-center text-[13px] font-semibold text-ink-900 ring-1 ring-ink-200/70 transition-colors hover:bg-ink-50 active:scale-[.99]"
          >
            Browse all products
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand-600" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>

          {!user && (
            <div className="rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white lg:hidden">
              <p className="text-[15px] font-bold tracking-tight">
                Sign up &amp; unlock cashback
              </p>
              <p className="mt-1 text-[12px] font-medium opacity-90">
                Instant rewards, tracked orders, fast payouts.
              </p>
              <div className="mt-4 flex gap-2">
                <Link
                  to="/signup"
                  className="rounded-lg bg-white px-3.5 py-2 text-[12.5px] font-semibold text-ink-950 transition-colors hover:bg-white/90"
                >
                  Create account
                </Link>
                <Link
                  to="/login"
                  className="rounded-lg bg-white/15 px-3.5 py-2 text-[12.5px] font-semibold text-white ring-1 ring-inset ring-white/20 transition-colors hover:bg-white/20"
                >
                  Log in
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT RAIL (desktop) */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-3">
            <Link
              to="/wallet"
              className="block rounded-xl bg-gradient-to-br from-ink-900 to-ink-800 p-4 text-white transition-colors hover:from-ink-800 hover:to-ink-800"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/50">
                Wallet balance
              </p>
              <p className="mt-1.5 text-[24px] font-bold tracking-[-0.02em] tabular-nums">
                {formatNaira(balance)}
              </p>
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-brand-300">
                <span>Withdraw to bank</span>
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </div>
            </Link>

            {activePackage ? (
              <Link
                to={`/packages/${activePackage.id}`}
                className="block rounded-xl bg-white p-4 ring-1 ring-ink-200/70 transition-colors hover:ring-ink-300"
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-violet-50 text-violet-600">
                    🛍️
                  </span>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-violet-600">
                      Active special order
                    </p>
                    <p className="truncate text-[12.5px] font-semibold text-ink-900">
                      {activePackage.title}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-[11.5px] font-medium text-ink-400">
                  {activePackage.status.replace(/_/g, ' ')} · {activePackage.items.length} items
                </p>
              </Link>
            ) : (
              <Link
                to="/packages/new"
                className="block rounded-xl bg-white p-4 ring-1 ring-ink-200/70 transition-colors hover:ring-ink-300"
              >
                <div className="flex items-center gap-2">
                  <span className="grid h-7 w-7 place-items-center rounded-md bg-violet-50 text-violet-600">
                    🛍️
                  </span>
                  <p className="text-[12px] font-semibold text-ink-900">Special orders</p>
                </div>
                <p className="mt-1.5 text-[11.5px] font-medium leading-relaxed text-ink-400">
                  Create a shopping list — we source it and deliver to your door.
                </p>
                <span className="mt-2.5 inline-flex items-center gap-1 text-[11.5px] font-semibold text-violet-600">
                  Start a list
                  <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            )}

            <div className="rounded-xl bg-white p-2 ring-1 ring-ink-200/70">
              <QuickLink to="/orders" icon="📦" label="My orders" />
              <QuickLink to="/packages" icon="🛍️" label="Special orders" />
              <QuickLink to="/disputes" icon="⚖️" label="Support & disputes" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function QuickLink({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-ink-50"
    >
      <span className="text-[14px]">{icon}</span>
      <span className="flex-1 text-[12.5px] font-semibold text-ink-700">{label}</span>
      <svg viewBox="0 0 24 24" className="h-3 w-3 text-ink-300" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 6 6 6-6 6" />
      </svg>
    </Link>
  );
}