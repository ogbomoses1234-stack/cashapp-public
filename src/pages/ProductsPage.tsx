import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PublicShell } from '@/layouts/PublicShell';
import { ProductGrid } from '@/components/product/ProductGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductGridSkeleton } from '@/components/ui/Skeleton';
import { listProducts } from '@/services/product.service';
import { listCategories, type Category } from '@/services/category.service';
import type { Product } from '@/types';
import { useDebounce } from '@/hooks/useDebounce';

type SortKey = 'newest' | 'price_asc' | 'price_desc';

const SORTS: Array<{ key: SortKey; label: string }> = [
  { key: 'newest', label: 'Newest' },
  { key: 'price_asc', label: '₦ Low → High' },
  { key: 'price_desc', label: '₦ High → Low' },
];

export default function ProductsPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const query = params.get('q') ?? '';
  const categorySlug = params.get('category') ?? '';
  const sort = (params.get('sort') as SortKey) ?? 'newest';

  const [searchInput, setSearchInput] = useState(query);
  const debouncedSearch = useDebounce(searchInput, 300);

  useEffect(() => {
    const current = params.get('q') ?? '';
    if (debouncedSearch !== current) {
      const next = new URLSearchParams(params);
      if (debouncedSearch) next.set('q', debouncedSearch);
      else next.delete('q');
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line
  }, [debouncedSearch]);

  useEffect(() => {
    listCategories()
      .then((c) => setCategories(Array.isArray(c) ? c : []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    listProducts({
      search: query || undefined,
      category: categorySlug || undefined,
      sort,
      perPage: 100,
    })
      .then((data) => alive && setProducts(Array.isArray(data) ? data : []))
      .catch(() => alive && setProducts([]))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [query, categorySlug, sort]);

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const clearAll = () => {
    setSearchInput('');
    setParams(new URLSearchParams(), { replace: true });
  };

  const hasFilters = query || categorySlug || sort !== 'newest';
  const categoryName = useMemo(() => {
    if (!categorySlug) return null;
    return categories.find((c) => c.slug === categorySlug)?.name ?? categorySlug;
  }, [categories, categorySlug]);

  return (
    <PublicShell>
      <div className="mb-4">
        <h1 className="text-[26px] font-bold tracking-[-0.025em]">
          {categoryName ?? 'All products'}
        </h1>
        <p className="mt-1 text-[12.5px] font-medium text-ink-500">
          {loading ? 'Loading…' : `${products.length} ${products.length === 1 ? 'product' : 'products'}`}
          {query && ` · "${query}"`}
        </p>
      </div>

      <label className="mb-4 flex items-center gap-2.5 rounded-lg bg-white px-4 py-3.5 ring-1 ring-ink-200/70 transition-shadow focus-within:ring-2 focus-within:ring-brand-500">
        <svg className="h-4 w-4 flex-shrink-0 text-ink-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products by name…"
          className="w-full border-0 bg-transparent text-[13.5px] font-medium text-ink-900 outline-none placeholder:text-ink-400"
        />
        {searchInput && (
          <button
            type="button"
            onClick={() => setSearchInput('')}
            className="grid h-6 w-6 place-items-center rounded-md text-ink-400 transition-colors hover:bg-ink-100"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </label>

      {categories.length > 0 && (
        <div className="scrollbar-none -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
          <button
            type="button"
            onClick={() => updateParam('category', null)}
            className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-[12px] font-semibold tracking-[-0.005em] transition-colors ${
              !categorySlug
                ? 'bg-ink-900 text-white'
                : 'bg-white text-ink-500 ring-1 ring-inset ring-ink-200 hover:text-ink-900'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.slug}
              type="button"
              onClick={() => updateParam('category', c.slug)}
              className={`whitespace-nowrap rounded-lg px-3.5 py-2 text-[12px] font-semibold capitalize tracking-[-0.005em] transition-colors ${
                categorySlug === c.slug
                  ? 'bg-ink-900 text-white'
                  : 'bg-white text-ink-500 ring-1 ring-inset ring-ink-200 hover:text-ink-900'
              }`}
            >
              {c.name}
              <span className={`ml-1.5 ${categorySlug === c.slug ? 'text-brand-300' : 'text-ink-400'}`}>
                {c.count}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="scrollbar-none -mx-4 mb-5 flex items-center gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        {SORTS.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => updateParam('sort', s.key === 'newest' ? null : s.key)}
            className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-[11.5px] font-semibold tracking-[-0.005em] transition-colors ${
              sort === s.key
                ? 'bg-ink-900 text-white'
                : 'bg-white text-ink-500 ring-1 ring-inset ring-ink-200 hover:text-ink-900'
            }`}
          >
            {s.label}
          </button>
        ))}
        {hasFilters && (
          <button
            type="button"
            onClick={clearAll}
            className="ml-auto whitespace-nowrap text-[11.5px] font-semibold text-rose-600 hover:text-rose-700"
          >
            Clear filters
          </button>
        )}
      </div>

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : products.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No products found"
          hint={query ? `Nothing matches "${query}".` : 'Try a different filter.'}
          action={
            hasFilters ? (
              <button
                type="button"
                onClick={clearAll}
                className="rounded-lg bg-ink-900 px-4 py-2.5 text-[12px] font-semibold text-white"
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <ProductGrid products={products} />
      )}

      <button
        type="button"
        onClick={() => navigate('/')}
        className="mt-8 block w-full text-center text-[12px] font-semibold text-ink-400 transition-colors hover:text-ink-700"
      >
        ← Back to home
      </button>
    </PublicShell>
  );
}