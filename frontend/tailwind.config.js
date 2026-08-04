/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'rgb(var(--bg) / <alpha-value>)',
          soft: 'rgb(var(--bg-soft) / <alpha-value>)',
          elev: 'rgb(var(--bg-elev) / <alpha-value>)',
          elev2: 'rgb(var(--bg-elev2) / <alpha-value>)',
        },
        fg: {
          DEFAULT: 'rgb(var(--fg) / <alpha-value>)',
          muted: 'rgb(var(--fg-muted) / <alpha-value>)',
          subtle: 'rgb(var(--fg-subtle) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--border) / <alpha-value>)',
          soft: 'rgb(var(--border-soft) / <alpha-value>)',
        },
        crimson: {
          DEFAULT: 'rgb(var(--crimson) / <alpha-value>)',
          bright: 'rgb(var(--crimson-bright) / <alpha-value>)',
          fill: 'rgb(var(--crimson-fill) / <alpha-value>)',
        },
        ember: 'rgb(var(--ember) / <alpha-value>)',
        gold: 'rgb(var(--gold) / <alpha-value>)',
        success: 'rgb(var(--success) / <alpha-value>)',
        warning: 'rgb(var(--warning) / <alpha-value>)',
        danger: 'rgb(var(--danger) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: { xl: '1rem', '2xl': '1.25rem', '3xl': '1.75rem' },
      boxShadow: {
        glow: '0 0 40px -8px rgb(var(--glow) / 0.6)',
        'glow-lg': '0 0 60px -6px rgb(var(--glow) / 0.7)',
        card: '0 1px 3px rgb(0 0 0 / 0.2), 0 12px 32px -16px rgb(0 0 0 / 0.5)',
        lift: '0 24px 60px -24px rgb(var(--glow) / 0.5)',
      },
      keyframes: {
        'gradient-move': { to: { backgroundPosition: '200% center' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        breathe: { '0%,100%': { opacity: '0.55', transform: 'scale(1)' }, '50%': { opacity: '1', transform: 'scale(1.18)' } },
      },
      animation: {
        'gradient-move': 'gradient-move 5s linear infinite',
        float: 'float 6s ease-in-out infinite',
        breathe: 'breathe 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
