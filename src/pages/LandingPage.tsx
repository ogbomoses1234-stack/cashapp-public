import { useEffect, useState } from 'react';
import { Watermark } from '@/components/brand/Watermark';
import { Link, useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { ProductGrid } from '@/components/product/ProductGrid';
import { BannerCarousel } from '@/components/banner/BannerCarousel';
import { CategoryStrip } from '@/components/category/CategoryStrip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { listProducts } from '@/services/product.service';
import { listBanners, type Banner } from '@/services/banner.service';
import { listCategories, type Category } from '@/services/category.service';
import type { Product } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

const HOME_PRODUCT_PREVIEW = 6;

export default function LandingPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const openAuthModal = useUIStore((s) => s.openAuthModal);

  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.allSettled([
      listBanners(),
      listCategories(),
      listProducts({ perPage: HOME_PRODUCT_PREVIEW }),
    ]).then(([b, c, p]) => {
      if (!alive) return;
      if (b.status === 'fulfilled') setBanners(b.value);
      if (c.status === 'fulfilled') setCategories(c.value);
      if (p.status === 'fulfilled') setProducts(Array.isArray(p.value) ? p.value : []);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, []);

  const goToSearch = () => {
    if (user) {
      navigate('/products');
    } else {
      openAuthModal('Create an account to search, save favorites, and unlock ₦100 cashback.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-ink-900">
      <Watermark />
      <TopBar />

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-5">
        {/* Banner carousel */}
        {banners.length > 0 && <BannerCarousel banners={banners} />}

        {/* Search — public; taps prompt login */}
        <button
          type="button"
          onClick={goToSearch}
          className="mb-5 flex w-full items-center gap-2.5 rounded-2xl bg-white px-4 py-3.5 text-left shadow-card ring-1 ring-ink-100/60 transition active:scale-[.99]"
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

        {/* Categories */}
        {categories.length > 0 && (
          <CategoryStrip categories={categories} limit={6} showSeeAll />
        )}

        {/* Featured preview */}
        <section className="mb-6">
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
            <div className="grid grid-cols-2 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="h-64 animate-pulse rounded-3xl bg-white/60" />
              ))}
            </div>
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

        {/* Bottom CTA */}
        <Link
          to="/products"
          className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-4 text-center text-[13px] font-black text-ink-900 shadow-card ring-1 ring-ink-100/60 transition active:scale-[.99]"
        >
          Browse all products
          <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand-700" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>

        {/* Guest CTA */}
        {!user && (
          <div className="rounded-3xl bg-gradient-to-br from-brand-500 to-brand-700 p-5 text-white shadow-[0_12px_28px_-12px_rgba(16,185,129,.9)]">
            <p className="text-[15px] font-black leading-tight tracking-tight">
              Sign up & unlock ₦100 cashback
            </p>
            <p className="mt-1 text-[12px] font-medium opacity-80">
              Instant rewards, tracked orders, fast payouts.
            </p>
            <div className="mt-4 flex gap-2.5">
              <Button
                variant="dark"
                size="sm"
                onClick={() => navigate('/signup')}
                className="!bg-white !text-[#04140d] hover:!bg-white/90"
              >
                Create account
              </Button>
              <Button
                variant="dark"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Log in
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
