import { useEffect, useMemo, useState } from 'react';
import { Watermark } from '@/components/brand/Watermark';
import { useParams } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { ProductGrid } from '@/components/product/ProductGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { listProducts } from '@/services/product.service';
import { listCategories, type Category } from '@/services/category.service';
import type { Product } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

type SortKey = 'newest' | 'price_asc' | 'price_desc';

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest' },
  { key: 'price_asc', label: '₦ Low → High' },
  { key: 'price_desc', label: '₦ High → Low' },
];

export default function CategoryDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('newest');
  const [priceMax, setPriceMax] = useState<number | null>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!slug) return;
    listCategories()
      .then((list) => {
        const found = list.find((c) => c.slug === slug);
        setCategory(found ?? null);
      })
      .catch(() => setCategory(null));
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    let alive = true;
    setLoading(true);
    listProducts({
      category: slug,
      search: debouncedQuery || undefined,
      sort,
      perPage: 100,
    })
      .then((data) => alive && setProducts(Array.isArray(data) ? data : []))
      .catch(() => alive && setProducts([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug, debouncedQuery, sort]);

  const filtered = useMemo(() => {
    if (priceMax === null) return products;
    return products.filter((p) => parseFloat(p.price) <= priceMax);
  }, [products, priceMax]);

  const priceCeiling = useMemo(() => {
    if (products.length === 0) return 0;
    return Math.ceil(Math.max(...products.map((p) => parseFloat(p.price))) / 1000) * 1000;
  }, [products]);

  const categoryName = category?.name ?? slug?.replace(/-/g, ' ') ?? 'Category';

  return (
    <div className="min-h-screen bg-slate-50 text-ink-900">
      <Watermark />
      <TopBar />

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-5">
        {/* Header — no back button */}
        <div className="mb-5">
          <h1 className="text-[26px] font-black capitalize tracking-[-0.03em]">
            {categoryName}
          </h1>
          <p className="mt-1 text-[12.5px] font-medium text-slate-500">
            {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
          </p>
        </div>

        {/* Search */}
        <label className="mb-4 flex items-center gap-2.5 rounded-2xl bg-white px-4 py-3.5 shadow-card ring-1 ring-ink-100/60">
          <svg className="h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search in ${categoryName}…`}
            className="w-full border-0 bg-transparent text-[13.5px] font-semibold text-ink-900 outline-none placeholder:text-slate-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="grid h-6 w-6 place-items-center rounded-lg text-slate-400 hover:bg-slate-100"
              aria-label="Clear"
            >
              ✕
            </button>
          )}
        </label>

        {/* Sort + price chips */}
        <div className="scrollbar-none mb-5 flex gap-2 overflow-x-auto pb-1">
          {SORTS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSort(s.key)}
              className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-[12px] font-black tracking-tight transition ${
                sort === s.key
                  ? 'bg-ink-900 text-white shadow-[0_4px_12px_-4px_rgba(11,16,28,.4)]'
                  : 'bg-white text-slate-500 ring-1 ring-inset ring-ink-100/70'
              }`}
            >
              {s.label}
            </button>
          ))}

          {priceCeiling > 0 && (
            <>
              <span className="mx-1 my-auto h-5 w-px bg-slate-200" />
              <button
                type="button"
                onClick={() => setPriceMax(null)}
                className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-[12px] font-black tracking-tight transition ${
                  priceMax === null
                    ? 'bg-ink-900 text-white'
                    : 'bg-white text-slate-500 ring-1 ring-inset ring-ink-100/70'
                }`}
              >
                All prices
              </button>
              {[5000, 10000, 20000, 50000]
                .filter((v) => v < priceCeiling)
                .map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setPriceMax(v)}
                    className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-[12px] font-black tracking-tight transition ${
                      priceMax === v
                        ? 'bg-ink-900 text-white'
                        : 'bg-white text-slate-500 ring-1 ring-inset ring-ink-100/70'
                    }`}
                  >
                    ≤ ₦{v.toLocaleString()}
                  </button>
                ))}
            </>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size={28} className="!border-slate-300 !border-t-brand-500" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No products match"
            hint="Try a different search or clear the filters."
          />
        ) : (
          <ProductGrid products={filtered} />
        )}
      </main>
    </div>
  );
}
