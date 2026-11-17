/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./public/index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9',
          400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490',
          800: '#155e75', 900: '#164e63',
        },
        accent: {
          50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
          400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
          800: '#3730a3', 900: '#312e81',
        },
        ink: {
          50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
          400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
          800: '#1e293b', 900: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.06)',
        glow: '0 10px 40px -10px rgba(8, 145, 178, 0.45)',
        ring: '0 0 0 4px rgba(8, 145, 178, 0.15)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #06b6d4 0%, #6366f1 100%)',
        'page-mesh':
          'radial-gradient(at 20% 10%, rgba(34,211,238,0.18) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(99,102,241,0.18) 0px, transparent 50%), radial-gradient(at 0% 90%, rgba(165,180,252,0.18) 0px, transparent 50%)',
        'page-mesh-dark':
          'radial-gradient(at 20% 10%, rgba(34,211,238,0.10) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(99,102,241,0.10) 0px, transparent 50%), radial-gradient(at 0% 90%, rgba(165,180,252,0.07) 0px, transparent 50%)',
      },
      animation: {
        'fade-in': 'fadeIn .35s ease-out both',
        'slide-up': 'slideUp .45s cubic-bezier(.2,.8,.2,1) both',
        'pulse-soft': 'pulseSoft 2.4s ease-in-out infinite',
        'shimmer': 'shimmer 1.6s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        pulseSoft: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.6 } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
    },
  },
  plugins: [],
};
