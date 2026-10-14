#!/usr/bin/env python3
"""
Hide products already in the cart from the Featured Products section
on the public home page.

Adds a `useCartProductIds()` hook and uses it to filter `featured`.
"""
from pathlib import Path
import re

ROOT = Path.home() / "qrcashback-frontend-public"

# ═══════════════════════════════════════════════════════════════
# 1. Create a hook that returns the set of productIds in the cart
# ═══════════════════════════════════════════════════════════════
hook_path = ROOT / "src/hooks/useCartProductIds.ts"
hook_path.parent.mkdir(parents=True, exist_ok=True)
hook_path.write_text('''import { useEffect, useState } from 'react';
import { get } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface CartItem {
  id: string;
  productId?: string;
  product?: { id: string };
}

/**
 * Returns a Set of productIds currently in the user's cart.
 * Empty set for guests or when the cart is empty.
 *
 * Refetches on window focus and whenever `cart:changed` is dispatched.
 * Emit that event after add/remove so all mounted consumers update.
 */
export function useCartProductIds(): Set<string> {
  const { user } = useAuth();
  const [ids, setIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setIds(new Set());
      return;
    }

    let alive = true;

    const load = async () => {
      try {
        const data = await get<CartItem[] | { items: CartItem[] }>('/api/public/cart');
        const list = Array.isArray(data) ? data : (data as any).items ?? [];
        const next = new Set<string>();
        for (const row of list) {
          const pid = row.productId ?? row.product?.id;
          if (pid) next.add(pid);
        }
        if (alive) setIds(next);
      } catch {
        if (alive) setIds(new Set());
      }
    };

    load();
    const onFocus = () => load();
    const onChanged = () => load();

    window.addEventListener('focus', onFocus);
    window.addEventListener('cart:changed', onChanged);

    return () => {
      alive = false;
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('cart:changed', onChanged);
    };
  }, [user]);

  return ids;
}
''', encoding="utf-8")
print(f"✅ Created src/hooks/useCartProductIds.ts")

# ═══════════════════════════════════════════════════════════════
# 2. Patch LandingPage.tsx to filter featured products
# ═══════════════════════════════════════════════════════════════
landing = ROOT / "src/pages/LandingPage.tsx"
if not landing.exists():
    print("⚠️  LandingPage.tsx not found — skipping")
else:
    src = landing.read_text(encoding="utf-8")
    changed = False

    # Add import
    if "useCartProductIds" not in src:
        src = src.replace(
            "import { listProducts } from '@/services/product.service';",
            "import { listProducts } from '@/services/product.service';\nimport { useCartProductIds } from '@/hooks/useCartProductIds';",
            1,
        )
        changed = True
        print("  ✅ Added useCartProductIds import")

    # Add hook call near other hooks
    if "const cartProductIds" not in src:
        # Try to find the component body
        patterns = [
            ("const debouncedQuery = useDebounce(query, 300);",
             "const debouncedQuery = useDebounce(query, 300);\n  const cartProductIds = useCartProductIds();"),
            ("const [query, setQuery] = useState('');",
             "const [query, setQuery] = useState('');\n  const cartProductIds = useCartProductIds();"),
        ]
        for before, after in patterns:
            if before in src:
                src = src.replace(before, after, 1)
                changed = True
                print("  ✅ Injected cartProductIds hook")
                break
        else:
            print("  ⚠️  Could not find hook injection point — MANUAL patch needed")

    # Filter featured
    # Handle multiple possible patterns
    patterns = [
        # Pattern A: direct inline filter
        (
            "const featured = useMemo(\n    () => products.filter((p) => p.isFeatured).slice(0, 6),\n    [products]\n  );",
            "const featured = useMemo(\n    () => products.filter((p) => p.isFeatured && !cartProductIds.has(p.id)).slice(0, 6),\n    [products, cartProductIds]\n  );"
        ),
        # Pattern B: simpler one-liner
        (
            "const featured = products.filter((p) => p.isFeatured).slice(0, 6);",
            "const featured = products.filter((p) => p.isFeatured && !cartProductIds.has(p.id)).slice(0, 6);"
        ),
        # Pattern C: with different whitespace
        (
            "products.filter((p) => p.isFeatured)",
            "products.filter((p) => p.isFeatured && !cartProductIds.has(p.id))"
        ),
    ]

    for before, after in patterns:
        if before in src:
            src = src.replace(before, after, 1)
            changed = True
            print("  ✅ Filtered cart items from featured")
            break
    else:
        print("  ⚠️  Could not find featured filter — MANUAL patch needed")
        print("     Look for: products.filter((p) => p.isFeatured)")
        print("     Change to: products.filter((p) => p.isFeatured && !cartProductIds.has(p.id))")

    if changed:
        landing.write_text(src, encoding="utf-8")

# ═══════════════════════════════════════════════════════════════
# 3. Tell ProductCard to emit 'cart:changed' after add
# ═══════════════════════════════════════════════════════════════
product_card = ROOT / "src/components/product/ProductCard.tsx"
if product_card.exists():
    src = product_card.read_text(encoding="utf-8")
    if "cart:changed" not in src:
        # Look for the add-to-cart handler and inject dispatch after
        patterns = [
            # After await addToCart
            (
                "await addToCart(",
                "await addToCart("
            ),
        ]
        # Simpler: find the closing brace of the handler, inject dispatch
        # Try to find `handleAdd` and add dispatch at the end of the async fn
        match = re.search(r"(const handleAdd\w*\s*=\s*async\s*\([^)]*\)\s*=>\s*\{[\s\S]*?)(\n\s*\};)", src)
        if match:
            header, closer = match.group(1), match.group(2)
            if "window.dispatchEvent" not in header:
                new_header = header + "\n    window.dispatchEvent(new Event('cart:changed'));"
                src = src.replace(header + closer, new_header + closer, 1)
                product_card.write_text(src, encoding="utf-8")
                print("  ✅ ProductCard.tsx — emits cart:changed after add")
            else:
                print("  ℹ️  ProductCard already emits cart:changed")
        else:
            print("  ⚠️  Could not find add-to-cart handler — MANUAL patch needed")
            print("     Add `window.dispatchEvent(new Event('cart:changed'));` after await addToCart(...)")
    else:
        print("  ℹ️  ProductCard already emits cart:changed")
else:
    print("  ⚠️  ProductCard.tsx not found")

print("""
═══════════════════════════════════════════════════════════════
Done.

Next:

  # Restart the public dev server
  # Ctrl+C then: npm run dev

  # Then reload http://localhost:5173
  # Products in your cart should be hidden from Featured.
═══════════════════════════════════════════════════════════════
""")
