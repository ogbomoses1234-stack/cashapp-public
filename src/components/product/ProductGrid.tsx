import type { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface Props {
  products: Product[];
  /**
   * - `auto`  · 2 mobile → 3 tablet → 4 desktop (default, for full-width pages)
   * - `2`     · always 2 columns (for products inside a right rail)
   */
  columns?: 'auto' | 2;
}

export function ProductGrid({ products, columns = 'auto' }: Props) {
  if (products.length === 0) return null;

  const gridClass =
    columns === 2
      ? 'grid grid-cols-2 gap-3'
      : 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4';

  return (
    <div className={gridClass}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}