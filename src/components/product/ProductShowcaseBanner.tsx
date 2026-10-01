import type { Product } from '@/types';
import { formatNaira } from '@/utils/format';

interface Props {
  products: Product[];
  /** How many product cards to stack */
  limit?: number;
}

/* Emoji + tint fallbacks when a product has no thumbnail */
const FALLBACK_TONES = [
  'from-emerald-100 to-emerald-200',
  'from-violet-100 to-violet-200',
  'from-amber-100 to-amber-200',
  'from-rose-100 to-rose-200',
];
const FALLBACK_ICONS = ['🧴', '🧼', '🧖', '🎁'];

export function ProductShowcaseBanner({ products, limit = 3 }: Props) {
  // Take the first N products; if fewer than limit, that's fine
  const featured = products.slice(0, limit);

  if (featured.length === 0) {
    return <EmptyShowcase />;
  }

  return (
    <div className="relative h-full">
      {/* Cascade — each card is offset down-right, creating a stack */}
      <div className="relative flex flex-col gap-2">
        {featured.map((p, i) => (
          <ShowcaseCard
            key={p.id}
            product={p}
            index={i}
            total={featured.length}
          />
        ))}
      </div>

      {/* Floating "live" chip on the top card */}
      {featured[0] && (
        <div className="pointer-events-none absolute -left-3 -top-3 rotate-[-8deg] rounded-lg bg-brand-400 px-2 py-1 shadow-[0_8px_20px_-6px_rgba(52,211,153,.9)]">
          <span className="block text-[9px] font-black leading-none tracking-wider text-[#04140d]">
            LIVE
          </span>
        </div>
      )}
    </div>
  );
}

/* ─── Individual card ───────────────────────────────────── */
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

  // Tilt pattern: -4° / 2° / -6° — organic, not mechanical
  const tilts = [-4, 2, -6, 3];
  const tilt = tilts[index % tilts.length];

  // Left offset pattern: brings the middle card forward
  const offsets = ['translate-x-1', 'translate-x-0', '-translate-x-1'];
  const offset = offsets[index % offsets.length];

  // Opacity falls off for cards further down
  const opacity = index === 0 ? 1 : index === 1 ? 0.94 : 0.86;

  return (
    <div
      className={`${offset} transform transition-transform duration-500 hover:translate-x-0`}
      style={{
        transform: `rotate(${tilt}deg)`,
        opacity,
        zIndex: total - index,
      }}
    >
      <div className="flex items-center gap-2.5 rounded-2xl bg-white p-2 pr-3 shadow-[0_12px_28px_-10px_rgba(0,0,0,.65)] ring-1 ring-black/[.04]">
        {/* Product image or fallback */}
        <div
          className={`grid h-11 w-11 flex-shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br ${tint}`}
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
                  img.parentElement.classList.add('text-lg');
                  img.parentElement.textContent = emoji;
                }
              }}
            />
          ) : (
            <span className="text-lg">{emoji}</span>
          )}
        </div>

        {/* Product info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11.5px] font-black leading-tight tracking-tight text-ink-900">
            {product.title}
          </p>
          <p className="mt-0.5 text-[11px] font-bold tracking-tight text-ink-400">
            {formatNaira(product.price)}
          </p>
        </div>

        {/* +₦100 badge — only on the top card, feels like a highlight */}
        {index === 0 && (
          <span className="flex-shrink-0 rounded-lg bg-brand-500/15 px-1.5 py-1 text-[9px] font-black tracking-tight text-brand-700 ring-1 ring-inset ring-brand-500/20">
            +₦100
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Empty fallback ───────────────────────────────────── */
function EmptyShowcase() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[.02] p-4 text-center">
      <span className="mb-2 text-2xl opacity-40">📦</span>
      <p className="text-[11px] font-bold text-white/50">
        Products loading…
      </p>
    </div>
  );
}
