import type { Product } from '@/types';
import { formatNaira } from '@/utils/format';

interface Props {
  products: Product[];
  limit?: number;
}

const FALLBACK_TONES = [
  'from-emerald-100 to-emerald-200',
  'from-violet-100 to-violet-200',
  'from-amber-100 to-amber-200',
  'from-rose-100 to-rose-200',
];
const FALLBACK_ICONS = ['🧴', '🧼', '🧖', '🎁'];

export function ProductShowcaseBanner({ products, limit = 3 }: Props) {
  const featured = products.slice(0, limit);

  if (featured.length === 0) return <EmptyShowcase />;

  return (
    <div className="relative h-full">
      <div className="relative flex flex-col gap-2">
        {featured.map((p, i) => (
          <ShowcaseCard key={p.id} product={p} index={i} total={featured.length} />
        ))}
      </div>

      {featured[0] && (
        <div className="pointer-events-none absolute -left-2.5 -top-2.5 -rotate-[8deg] rounded-md bg-brand-500 px-2 py-1 shadow-md shadow-brand-500/30">
          <span className="block text-[9px] font-bold leading-none tracking-wider text-ink-950">
            LIVE
          </span>
        </div>
      )}
    </div>
  );
}

function ShowcaseCard({
  product,
  index,
  total,
}: {
  product: Product;
  index: number;
  total: number;
}) {
  const tint = FALLBACK_TONES[index % FALLBACK_TONES.length];
  const emoji = FALLBACK_ICONS[index % FALLBACK_ICONS.length];
  const tilts = [-3, 1.5, -4, 2];
  const tilt = tilts[index % tilts.length];
  const offsets = ['translate-x-1', 'translate-x-0', '-translate-x-1'];
  const offset = offsets[index % offsets.length];
  const opacity = index === 0 ? 1 : index === 1 ? 0.95 : 0.88;

  return (
    <div
      className={`${offset} transform transition-transform duration-500 hover:translate-x-0`}
      style={{
        transform: `rotate(${tilt}deg)`,
        opacity,
        zIndex: total - index,
      }}
    >
      <div className="flex items-center gap-2.5 rounded-lg bg-white p-2 pr-3 shadow-md shadow-ink-950/10 ring-1 ring-ink-200/60">
        <div
          className={`grid h-10 w-10 flex-shrink-0 place-items-center overflow-hidden rounded-md bg-gradient-to-br ${tint}`}
        >
          {product.thumbnailUrl ? (
            <img
              src={product.thumbnailUrl}
              alt={product.title}
              className="h-full w-full object-cover"
              loading="lazy"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
                if (img.parentElement) {
                  img.parentElement.classList.add('text-base');
                  img.parentElement.textContent = emoji;
                }
              }}
            />
          ) : (
            <span className="text-base">{emoji}</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[11.5px] font-semibold leading-tight tracking-[-0.005em] text-ink-900">
            {product.title}
          </p>
          <p className="mt-0.5 text-[11px] font-medium tabular-nums text-ink-400">
            {formatNaira(product.price)}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyShowcase() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-white p-4 text-center">
      <span className="mb-2 text-xl opacity-40">📦</span>
      <p className="text-[11px] font-medium text-ink-400">Products loading…</p>
    </div>
  );
}