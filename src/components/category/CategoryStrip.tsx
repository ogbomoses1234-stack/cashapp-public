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
      {/* Header */}
      <div className="mb-3 flex items-end justify-between">
        <h3 className="text-[15px] font-semibold tracking-[-0.01em] text-ink-900">
          Shop by category
        </h3>
        {showSeeAll && (
          <Link
            to="/categories"
            className="text-[12px] font-semibold text-brand-600 transition-colors duration-150 hover:text-brand-700"
          >
            See all →
          </Link>
        )}
      </div>

      {/* Strip */}
      <div className="scrollbar-none -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
        {visible.map((c, i) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => navigate(`/categories/${c.slug}`)}
            className="group flex w-[100px] flex-shrink-0 flex-col items-center gap-2"
          >
            <div
              className={`
                grid aspect-square w-full place-items-center overflow-hidden
                rounded-xl bg-gradient-to-br ${TONES[i % TONES.length]}
                ring-1 ring-inset ring-black/[.04]
                transition-transform duration-200
                group-hover:scale-[1.03] group-active:scale-95
              `}
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
                      img.parentElement.classList.add('text-2xl');
                      img.parentElement.textContent = ICONS[i % ICONS.length];
                    }
                  }}
                />
              ) : (
                <span className="text-2xl">{ICONS[i % ICONS.length]}</span>
              )}
            </div>
            <div className="text-center">
              <p className="line-clamp-1 text-[11.5px] font-semibold capitalize tracking-[-0.005em] text-ink-900">
                {c.name}
              </p>
              <p className="mt-0.5 text-[10px] font-medium text-ink-400">
                {c.count} {c.count === 1 ? 'item' : 'items'}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}