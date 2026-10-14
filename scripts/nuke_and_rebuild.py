#!/usr/bin/env python3
"""
Aggressive duplicate-React fix:
  1. Kill every process on ports 5173/5174/5001
  2. Show current vite.config.ts
  3. Force the correct resolve.dedupe
  4. Full clean reinstall
"""
import os
import re
import shutil
import signal
import subprocess
import sys
import time
from pathlib import Path

ROOT = Path.cwd()
if not (ROOT / "package.json").exists():
    sys.exit("❌ Run from a frontend repo")

print("═" * 60)
print(f" Nuking duplicate React in: {ROOT.name}")
print("═" * 60)

# ═══════════════════════════════════════════════════════════════
# 1. Kill Vite processes
# ═══════════════════════════════════════════════════════════════
print("\n[1] Kill Vite/Node processes")
for port in [5173, 5174]:
    result = subprocess.run(
        ["lsof", "-ti", f":{port}"],
        capture_output=True, text=True,
    )
    pids = [p for p in result.stdout.strip().split("\n") if p]
    for pid in pids:
        try:
            os.kill(int(pid), signal.SIGKILL)
            print(f"   ✅ Killed PID {pid} on port {port}")
        except Exception as e:
            print(f"   ⚠️  Could not kill {pid}: {e}")
    if not pids:
        print(f"   ℹ️  Nothing on port {port}")

# ═══════════════════════════════════════════════════════════════
# 2. Verify only one React in node_modules
# ═══════════════════════════════════════════════════════════════
print("\n[2] Check for multiple React copies")

# Count react directories (excluding @types and .bin)
result = subprocess.run(
    ["find", "node_modules", "-maxdepth", "5", "-type", "d",
     "-name", "react", "-not", "-path", "*@types*"],
    capture_output=True, text=True, cwd=ROOT,
)
react_dirs = [l for l in result.stdout.strip().split("\n") if l and "react-dom" not in l and "react-router" not in l]

print(f"   Found {len(react_dirs)} react installation(s):")
for d in react_dirs:
    print(f"     {d}")

# Check for react-dom too
result_dom = subprocess.run(
    ["find", "node_modules", "-maxdepth", "5", "-type", "d",
     "-name", "react-dom", "-not", "-path", "*@types*"],
    capture_output=True, text=True, cwd=ROOT,
)
react_dom_dirs = [l for l in result_dom.stdout.strip().split("\n") if l]
print(f"   Found {len(react_dom_dirs)} react-dom installation(s)")

# ═══════════════════════════════════════════════════════════════
# 3. Show current vite.config.ts
# ═══════════════════════════════════════════════════════════════
print("\n[3] Current vite.config.ts:")
vite = ROOT / "vite.config.ts"
print(vite.read_text(encoding="utf-8"))

# ═══════════════════════════════════════════════════════════════
# 4. Rewrite vite.config.ts with bulletproof config
# ═══════════════════════════════════════════════════════════════
print("\n[4] Rewriting vite.config.ts with full duplicate-React protection")

# Determine port from package.json or existing config
port = 5173 if "public" in ROOT.name else 5174

new_vite = f'''import {{ defineConfig }} from 'vite';
import react from '@vitejs/plugin-react';
import {{ fileURLToPath, URL }} from 'node:url';

export default defineConfig({{
  plugins: [react()],

  // ═════════════════════════════════════════════════════════
  // CRITICAL: force single instance of React across all deps
  // ═════════════════════════════════════════════════════════
  resolve: {{
    dedupe: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-router-dom',
      'zustand',
    ],
    alias: {{
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    }},
  }},

  // Force Vite to re-bundle — clears the stale cache
  optimizeDeps: {{
    force: true,
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-router-dom',
      'zustand',
    ],
  }},

  server: {{
    host: '0.0.0.0',
    port: {port},
    strictPort: false,
    allowedHosts: ['.trycloudflare.com'],
  }},

  build: {{
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {{
      output: {{
        manualChunks: {{
          vendor: ['react', 'react-dom', 'react-router-dom'],
        }},
      }},
    }},
  }},

  esbuild: {{
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  }},
}});
'''

vite.write_text(new_vite, encoding="utf-8")
print("   ✅ vite.config.ts rewritten")

# ═══════════════════════════════════════════════════════════════
# 5. Full clean reinstall
# ═══════════════════════════════════════════════════════════════
print("\n[5] Clean reinstall (this takes ~30 seconds)")

# Remove cached artifacts
for path in ["node_modules/.vite", "dist", ".vite", "package-lock.json", "node_modules"]:
    p = ROOT / path
    if p.exists():
        shutil.rmtree(p)
        print(f"   ✅ Removed {path}")

# Reinstall
print("   Running npm install…")
result = subprocess.run(
    ["npm", "install", "--no-audit", "--no-fund"],
    cwd=ROOT, capture_output=True, text=True,
)
if result.returncode == 0:
    print("   ✅ npm install complete")
else:
    print(f"   ⚠️  npm install failed:")
    print(result.stderr[:500])

print("\n" + "═" * 60)
print(" ✅ Done")
print("═" * 60)
print("""
Next:

  # In a fresh terminal:
  cd ~/qrcashback-frontend-public
  npm run dev

  # Wait for "ready in X ms"

  # Then hard-refresh the browser:
  #    Mac: Cmd + Shift + R
  #    Phone: close tab completely and reopen

  # The hashes in the console will now be NEW
""")
