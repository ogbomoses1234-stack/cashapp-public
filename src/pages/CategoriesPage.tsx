import { useEffect, useState } from 'react';
import { Watermark } from '@/components/brand/Watermark';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { listCategories, type Category } from '@/services/category.service';

const TONES = [
  'from-emerald-100 to-emerald-200',
  'from-violet-100 to-violet-200',
  'from-amber-100 to-amber-200',
  'from-rose-100 to-rose-200',
  'from-sky-100 to-sky-200',
  'from-indigo-100 to-indigo-200',
];
const ICONS = ['🧴', '🧼', '🧖', '🎁', '🥛', '🌸'];

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listCategories()
      .then((c) => setCategories(Array.isArray(c) ? c : []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  const totalProducts = categories.reduce((s, c) => s + c.count, 0);

  return (
    <div className="min-h-screen bg-slate-50 text-ink-900">
      <Watermark />
      <TopBar />

      <main className="mx-auto max-w-3xl px-4 pb-24 pt-5">
        {/* Header — no back button, TopBar handles it */}
        <div className="mb-5">
          <h1 className="text-[26px] font-black tracking-[-0.03em]">
            All categories
          </h1>
          <p className="mt-1 text-[12.5px] font-medium text-slate-500">
            {categories.length}{' '}
            {categories.length === 1 ? 'category' : 'categories'}
            {totalProducts > 0 && ` · ${totalProducts} products`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Spinner size={28} className="!border-slate-300 !border-t-brand-500" />
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            icon="📂"
            title="No categories yet"
            hint="Categories appear automatically once products are added."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categories.map((c, i) => (
              <button
                key={c.slug}
                type="button"
                onClick={() => navigate(`/categories/${c.slug}`)}
                className="group overflow-hidden rounded-2xl bg-white text-left shadow-card ring-1 ring-ink-100/60 transition active:scale-[.98]"
              >
                <div
                  className={`grid aspect-square w-full place-items-center overflow-hidden bg-gradient-to-br ${TONES[i % TONES.length]}`}
                >
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                        if (img.parentElement) {
                          img.parentElement.classList.add('text-5xl');
                          img.parentElement.textContent = ICONS[i % ICONS.length];
                        }
                      }}
                    />
                  ) : (
                    <span className="text-5xl">{ICONS[i % ICONS.length]}</span>
                  )}
                </div>
                <div className="p-3.5">
                  <p className="line-clamp-1 text-[13.5px] font-black capitalize tracking-tight text-ink-900">
                    {c.name}
                  </p>
                  <p className="mt-0.5 text-[11px] font-bold text-ink-400">
                    {c.count} {c.count === 1 ? 'product' : 'products'}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
