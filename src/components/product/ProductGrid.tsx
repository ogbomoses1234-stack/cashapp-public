import type { Product } from '@/types';
import { ProductCard } from './ProductCard';

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3">
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} />
      ))}
    </div>
  );
}
