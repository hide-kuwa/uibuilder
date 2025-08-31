import type { Config } from 'tailwindcss'

export default {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './core/**/*.{ts,tsx}',
    './pages/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: { extend: {} },
  plugins: [
    // require('daisyui'),
  ],
} satisfies Config

