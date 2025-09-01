import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ff6600',
        secondary: '#f2f2f2',
        accent: '#c2410c',
        'text-primary': '#333333',
        'text-secondary': '#666666',
      },
    },
  },
  plugins: [],
}

export default config
