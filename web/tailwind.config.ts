import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class', '[data-theme="dark"]', '[data-theme="compact"]'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './core/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        panel: 'var(--panel)',
        panel2: 'var(--panel-2)',
        border: 'var(--border)',
        accent: 'var(--accent)',
        muted: 'var(--muted)',
        text: 'var(--text)',
      },
    },
  },
  plugins: [
    // require('daisyui'),
  ],
} satisfies Config
