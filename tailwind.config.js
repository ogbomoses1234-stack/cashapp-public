/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B0F14',
          50: '#F6F7F9',
          100: '#EAECEF',
          200: '#D6DAE0',
          300: '#A8B0BD',
          400: '#6B7280',
          500: '#4B5563',
          600: '#374151',
          700: '#1F2937',
          800: '#141A22',
          900: '#0B0F14',
        },
        brand: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
        accent: {
          amber: '#F59E0B',
          rose:  '#F43F5E',
          sky:   '#0EA5E9',
          violet:'#7C5CFF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'display':  ['40px', { lineHeight: '1', letterSpacing: '-0.03em', fontWeight: '900' }],
        'h1':       ['28px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'h2':       ['20px', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '800' }],
        'h3':       ['16px', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '700' }],
        'body':     ['14px', { lineHeight: '1.55' }],
        'small':    ['12.5px', { lineHeight: '1.5' }],
        'micro':    ['11px', { lineHeight: '1.4', fontWeight: '700' }],
      },
      boxShadow: {
        'card':     '0 1px 2px rgba(11,15,20,0.04), 0 4px 16px -4px rgba(11,15,20,0.06)',
        'card-lg':  '0 2px 4px rgba(11,15,20,0.04), 0 12px 32px -8px rgba(11,15,20,0.10)',
        'btn':      '0 1px 2px rgba(11,15,20,0.05), 0 6px 16px -6px rgba(11,15,20,0.15)',
        'brand':    '0 6px 20px -6px rgba(16,185,129,0.45)',
        'brand-lg': '0 12px 32px -8px rgba(16,185,129,0.55)',
        'ink':      '0 8px 24px -8px rgba(11,15,20,0.35)',
        'nav':      '0 -4px 24px -8px rgba(11,15,20,0.10)',
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '20px',
        '4xl': '28px',
        '5xl': '36px',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to:   { opacity: '1', transform: 'none' },
        },
        'scale-in': {
          from: { opacity: '0', transform: 'scale(.95)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-500px 0' },
          '100%': { backgroundPosition: '500px 0' },
        },
        'pulse-soft': {
          '0%,100%': { opacity: '1' },
          '50%':     { opacity: '.6' },
        },
      },
      animation: {
        'fade-up':   'fade-up .4s cubic-bezier(.2,.8,.2,1) both',
        'scale-in':  'scale-in .3s cubic-bezier(.2,.8,.2,1) both',
        'shimmer':   'shimmer 1.4s linear infinite',
        'pulse-soft':'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
