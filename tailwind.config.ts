import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'mc-bg': '#09090b',
        'mc-bg-secondary': 'rgba(24,24,27,0.6)',
        'mc-bg-tertiary': 'rgba(0,0,0,0.3)',
        'mc-border': 'rgba(255,255,255,0.08)',
        'mc-text': '#e4e4e7',
        'mc-text-secondary': '#71717a',
        'mc-accent': '#38bdf8',
        'mc-accent-green': '#34d399',
        'mc-accent-yellow': '#fbbf24',
        'mc-accent-red': '#f87171',
        'mc-accent-purple': '#818cf8',
        'mc-accent-pink': '#38bdf8',
        'mc-accent-cyan': '#34d399',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
