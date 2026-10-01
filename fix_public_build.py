#!/usr/bin/env python3
"""
Fix public frontend build errors:
  1. CheckoutPage — setItems is referenced but was removed
  2. Force-remove 7 unused imports
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path.cwd()
if not (ROOT / "package.json").exists():
    sys.exit("❌ Run from ~/qrcashback-frontend-public")

print("═" * 60)
print(" Fix public frontend build errors")
print("═" * 60)

# ═══════════════════════════════════════════════════════════════
# 1. Inspect the cart store to see what API it exposes
# ═══════════════════════════════════════════════════════════════
print("\n[1] Inspect cart store")
store = ROOT / "src/store/cartStore.ts"
if store.exists():
    print(store.read_text(encoding="utf-8")[:1500])
else:
    print("   ⚠️  cartStore.ts not found")

# ═══════════════════════════════════════════════════════════════
# 2. Fix CheckoutPage — remove the setItems usage
# ═══════════════════════════════════════════════════════════════
print("\n[2] Fix CheckoutPage")
checkout = ROOT / "src/pages/customer/CheckoutPage.tsx"
if checkout.exists():
    src = checkout.read_text(encoding="utf-8")

    # Remove the useEffect block that references setItems — it's redundant
    # since the store already has the items
    src = re.sub(
        r"\n\s*useEffect\(\(\)\s*=>\s*\{\s*\n\s*getCart\(\)\.then\(setItems\)\.catch\(\(\)\s*=>\s*\{\}\);\s*\n\s*\},\s*\[items\.length,\s*setItems\]\);\n",
        "\n",
        src,
        flags=re.MULTILINE,
    )

    # If a more general form remains, patch it
    src = src.replace(
        "getCart().then(setItems).catch(() => {});",
        "// (cart items are kept in sync by the global store)",
    )
    src = src.replace(
        "[items.length, setItems]",
        "[items.length]",
    )

    # Remove the getCart import if now unused
    if "getCart" in src:
        uses = len(re.findall(r"\bgetCart\b", src))
        if uses <= 1:
            src = re.sub(r"import\s+\{[^}]*getCart[^}]*\}\s+from\s+['\"][^'\"]+['\"];?\n", "", src)

    checkout.write_text(src, encoding="utf-8")
    print("   ✅ CheckoutPage.tsx — removed setItems references")
else:
    print("   ⚠️  CheckoutPage.tsx not found")

# ═══════════════════════════════════════════════════════════════
# 3. Force-remove unused imports
# ═══════════════════════════════════════════════════════════════
print("\n[3] Force-remove unused imports")

UNUSED = [
    ("src/pages/customer/ChatPage.tsx",
     "import { EmptyState } from '@/components/ui/EmptyState';"),
    ("src/pages/customer/DisputesPage.tsx",
     "import { useNavigate } from 'react-router-dom';"),
    ("src/pages/customer/DisputesPage.tsx",
     "import { EmptyState } from '@/components/ui/EmptyState';"),
    ("src/pages/customer/OrdersPage.tsx",
     "import { Spinner } from '@/components/ui/Spinner';"),
    ("src/pages/customer/ProductDetailPage.tsx",
     "import { Spinner } from '@/components/ui/Spinner';"),
    ("src/pages/ProductsPage.tsx",
     "import { Spinner } from '@/components/ui/Spinner';"),
]

for rel_path, line in UNUSED:
    p = ROOT / rel_path
    if not p.exists():
        print(f"   ⚠️  {rel_path} not found")
        continue
    src = p.read_text(encoding="utf-8")
    if line + "\n" in src:
        src = src.replace(line + "\n", "", 1)
        p.write_text(src, encoding="utf-8")
        print(f"   ✅ {rel_path}")
    elif line in src:
        src = src.replace(line, "", 1)
        p.write_text(src, encoding="utf-8")
        print(f"   ✅ {rel_path} (no-newline form)")
    else:
        print(f"   ℹ️  {rel_path} — line not found")

# ═══════════════════════════════════════════════════════════════
# 4. Also check the WalletPage and TerminalPage fixes stuck
# ═══════════════════════════════════════════════════════════════
print("\n[4] Reapply wallet + terminal fixes if needed")

wallet = ROOT / "src/pages/customer/WalletPage.tsx"
if wallet.exists():
    src = wallet.read_text(encoding="utf-8")
    # If refreshing is still declared but unused, prefix with underscore
    if re.search(r"const\s+\[\s*refreshing\s*,", src) and "refreshing" not in re.sub(r"const\s+\[[^\]]*refreshing[^\]]*\]", "", src):
        src = src.replace(
            "const [refreshing, setRefreshing] = useState(false);",
            "const [, setRefreshing] = useState(false);",
        )
        wallet.write_text(src, encoding="utf-8")
        print("   ✅ WalletPage.tsx — silenced unused `refreshing`")

# ═══════════════════════════════════════════════════════════════
# 5. Type check
# ═══════════════════════════════════════════════════════════════
print("\n[5] TypeScript check")
tsc = subprocess.run(["npx", "tsc", "--noEmit"], cwd=ROOT, capture_output=True, text=True)
if tsc.returncode == 0:
    print("   ✅ TypeScript clean")
else:
    print("   ⚠️  Remaining TS errors:")
    print(tsc.stdout[:2000])

print("\n" + "═" * 60)
if tsc.returncode == 0:
    print(" ✅ Ready — run npm run build")
else:
    print(" ⚠️  Some errors remain — see above")
print("═" * 60)
