import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0b0f',
        surface: '#12141a',
        'surface-2': '#181b23',
        border: '#242833',
        primary: {
          DEFAULT: '#6366f1',
          hover: '#818cf8',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#22d3ee',
          foreground: '#0a0b0f',
        },
        success: '#22c55e',
        warning: '#eab308',
        danger: '#ef4444',
        muted: '#8a8f9c',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.35s ease-out',
        'pulse-soft': 'pulse-soft 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
