import { Link, useNavigate } from 'react-router-dom';
import type { Category } from '@/services/category.service';

const TONES = [
  'from-emerald-100 to-emerald-200',
  'from-violet-100 to-violet-200',
  'from-amber-100 to-amber-200',
  'from-rose-100 to-rose-200',
  'from-sky-100 to-sky-200',
  'from-indigo-100 to-indigo-200',
];
const ICONS = ['🧴', '🧼', '🧖', '🎁', '🥛', '🌸'];

interface Props {
  categories: Category[];
  limit?: number;
  showSeeAll?: boolean;
}

export function CategoryStrip({ categories, limit = 6, showSeeAll = true }: Props) {
  const navigate = useNavigate();
  const visible = categories.slice(0, limit);

  if (visible.length === 0) return null;

  return (
    <section className="mb-6">
      <div className="mb-3 flex items-end justify-between">
        <h3 className="text-[15px] font-extrabold tracking-tight text-ink-900">
          Shop by category
        </h3>
        {showSeeAll && (
          <Link
            to="/categories"
            className="text-[11.5px] font-black text-brand-700 hover:text-brand-800"
          >
            See all →
          </Link>
        )}
      </div>

      <div className="scrollbar-none -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
        {visible.map((c, i) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => navigate(`/categories/${c.slug}`)}
            className="group flex w-[110px] flex-shrink-0 flex-col items-center gap-2"
          >
            <div
              className={`grid h-[86px] w-full place-items-center overflow-hidden rounded-2xl bg-gradient-to-br ${TONES[i % TONES.length]} ring-1 ring-inset ring-black/[.04] transition group-active:scale-95`}
            >
              {c.imageUrl ? (
                <img
                  src={c.imageUrl}
                  alt={c.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                    if (img.parentElement) {
                      img.parentElement.classList.add('text-3xl');
                      img.parentElement.textContent = ICONS[i % ICONS.length];
                    }
                  }}
                />
              ) : (
                <span className="text-3xl">{ICONS[i % ICONS.length]}</span>
              )}
            </div>
            <div className="text-center">
              <p className="line-clamp-1 text-[11.5px] font-black capitalize tracking-tight text-ink-900">
                {c.name}
              </p>
              <p className="text-[10px] font-bold text-ink-400">
                {c.count} {c.count === 1 ? 'item' : 'items'}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
