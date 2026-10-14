import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PublicShell } from '@/layouts/PublicShell';
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
    listProducts({ category: slug, search: debouncedQuery || undefined, sort, perPage: 100 })
      .then((data) => alive && setProducts(Array.isArray(data) ? data : []))
      .catch(() => alive && setProducts([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
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
    <PublicShell>
      <div className="mb-5">
        <h1 className="text-[26px] font-bold capitalize tracking-[-0.025em]">
          {categoryName}
        </h1>
        <p className="mt-1 text-[12.5px] font-medium text-ink-500">
          {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
        </p>
      </div>

      <label className="mb-4 flex items-center gap-2.5 rounded-lg bg-white px-4 py-3.5 ring-1 ring-ink-200/70">
        <svg className="h-4 w-4 text-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search in ${categoryName}…`}
          className="w-full border-0 bg-transparent text-[13.5px] font-medium text-ink-900 outline-none placeholder:text-ink-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="grid h-6 w-6 place-items-center rounded-md text-ink-400 hover:bg-ink-100"
            aria-label="Clear"
          >
            ✕
          </button>
        )}
      </label>

      <div className="scrollbar-none mb-5 flex gap-2 overflow-x-auto pb-1">
        {SORTS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setSort(s.key)}
            className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-[12px] font-semibold tracking-[-0.005em] transition-colors ${
              sort === s.key
                ? 'bg-ink-900 text-white'
                : 'bg-white text-ink-500 ring-1 ring-inset ring-ink-200'
            }`}
          >
            {s.label}
          </button>
        ))}

        {priceCeiling > 0 && (
          <>
            <span className="mx-1 my-auto h-5 w-px bg-ink-200" />
            <button
              type="button"
              onClick={() => setPriceMax(null)}
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-[12px] font-semibold tracking-[-0.005em] transition-colors ${
                priceMax === null
                  ? 'bg-ink-900 text-white'
                  : 'bg-white text-ink-500 ring-1 ring-inset ring-ink-200'
              }`}
            >
              All prices
            </button>
            {[5000, 10000, 20000, 50000].filter((v) => v < priceCeiling).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setPriceMax(v)}
                className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-[12px] font-semibold tracking-[-0.005em] transition-colors ${
                  priceMax === v
                    ? 'bg-ink-900 text-white'
                    : 'bg-white text-ink-500 ring-1 ring-inset ring-ink-200'
                }`}
              >
                ≤ ₦{v.toLocaleString()}
              </button>
            ))}
          </>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner size={26} tone="brand" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🔍" title="No products match" hint="Try a different search." />
      ) : (
        <ProductGrid products={filtered} />
      )}
    </PublicShell>
  );
}