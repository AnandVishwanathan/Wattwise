/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#00C48C',
          dark: '#009E72',
          light: '#E6FBF4',
        },
        warning: '#F59E0B',
        danger: '#EF4444',
        surface: 'var(--color-surface)',
        card: 'var(--color-card)',
        border: 'var(--color-border)',
        text: {
          primary: 'var(--color-text-primary)',
          muted: 'var(--color-text-muted)',
          hint: '#94A3B8',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        micro: ['11px', { fontWeight: '500' }],
        small: ['13px', { fontWeight: '400' }],
        body: ['15px', { fontWeight: '400' }],
        h3: ['18px', { fontWeight: '500' }],
        h2: ['22px', { fontWeight: '600' }],
        h1: ['28px', { fontWeight: '600' }],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        raised: '0 4px 16px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
}
