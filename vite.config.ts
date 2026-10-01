import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],

  // ═════════════════════════════════════════════════════════
  // CRITICAL: force single instance of React across all deps
  // ═════════════════════════════════════════════════════════
  resolve: {
    dedupe: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'react-router-dom',
      'zustand',
    ],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // Force Vite to re-bundle — clears the stale cache
  optimizeDeps: {
    force: true,
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-router-dom',
      'zustand',
    ],
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: false,
    allowedHosts: ['.trycloudflare.com'],
  },

  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },

  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
});
