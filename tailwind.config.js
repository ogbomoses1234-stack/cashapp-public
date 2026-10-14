/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ═══════════════════════════════════════════════
           BRAND — restrained green, one clear accent
        ═══════════════════════════════════════════════ */
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },

        /* ═══════════════════════════════════════════════
           INK — cool slate neutrals, single source of truth
        ═══════════════════════════════════════════════ */
        ink: {
          50:  '#f8fafc',
          100: '#f1f5f9',
          200: '#e5e9ef',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },

      /* ═══════════════════════════════════════════════
         SHADOWS — old names kept for backward-compat,
         redefined to be barely-there. New code should
         use ring-1 instead of shadow wherever possible.
      ═══════════════════════════════════════════════ */
      boxShadow: {
        'sm':    '0 1px 2px 0 rgb(15 23 42 / 0.04)',
        'md':    '0 4px 12px -2px rgb(15 23 42 / 0.08)',
        'lg':    '0 12px 32px -8px rgb(15 23 42 / 0.12)',
        'card':  '0 1px 2px 0 rgb(15 23 42 / 0.04)',
        'nav':   '0 4px 12px -2px rgb(15 23 42 / 0.08)',
        'btn':   '0 1px 2px 0 rgb(15 23 42 / 0.04)',
        'brand': '0 4px 12px -2px rgb(34 197 94 / 0.30)',
        'glow':  '0 4px 12px -2px rgb(34 197 94 / 0.25)',
      },

      /* ═══════════════════════════════════════════════
         ANIMATIONS — same names as before so nothing
         downstream breaks.
      ═══════════════════════════════════════════════ */
      keyframes: {
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to:   { opacity: '1', transform: 'none' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.55' },
        },
        'rotate-refresh': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'check-pop': {
          '0%':   { transform: 'scale(0)',    opacity: '0' },
          '60%':  { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)',    opacity: '1' },
        },
        'laser-sweep': {
          '0%, 100%': { top: '12px' },
          '50%':      { top: 'calc(100% - 16px)' },
        },
        'progress-indeterminate': {
          '0%':   { left: '-40%', width: '40%' },
          '50%':  { left: '30%',  width: '50%' },
          '100%': { left: '100%', width: '40%' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'bounce-dot': {
          '0%, 80%, 100%': { transform: 'scale(0.6)', opacity: '0.5' },
          '40%':           { transform: 'scale(1)',   opacity: '1' },
        },
        'ring-pulse': {
          '0%':   { transform: 'scale(0.9)',  opacity: '0.7' },
          '50%':  { transform: 'scale(1.15)', opacity: '0' },
          '100%': { transform: 'scale(1.15)', opacity: '0' },
        },
      },
      animation: {
        'spin-slow':       'spin-slow 0.9s linear infinite',
        'fade-in':         'fade-in 0.2s ease both',
        'fade-up':         'fade-up 0.3s cubic-bezier(.2,.8,.2,1) both',
        'pulse-soft':      'pulse-soft 1.8s ease-in-out infinite',
        'rotate-refresh':  'rotate-refresh 0.85s linear infinite',
        'check-pop':       'check-pop 0.45s cubic-bezier(.2,.8,.2,1) both',
        'laser':           'laser-sweep 2.3s cubic-bezier(.6,0,.4,1) infinite',
      },
    },
  },
  plugins: [],
};