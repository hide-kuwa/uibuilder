import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          canvas: 'hsl(var(--color-bg-canvas) / <alpha-value>)',
          panel: 'hsl(var(--color-bg-panel) / <alpha-value>)',
          muted: 'hsl(var(--color-bg-muted) / <alpha-value>)',
          elevated: 'hsl(var(--color-bg-elevated) / <alpha-value>)'
        },
        fg: {
          DEFAULT: 'hsl(var(--color-fg-default) / <alpha-value>)',
          muted: 'hsl(var(--color-fg-muted) / <alpha-value>)',
          inverted: 'hsl(var(--color-fg-inverted) / <alpha-value>)'
        },
        border: {
          DEFAULT: 'hsl(var(--color-border-default) / <alpha-value>)',
          muted: 'hsl(var(--color-border-muted) / <alpha-value>)'
        },
        accent: {
          DEFAULT: 'hsl(var(--color-accent-default) / <alpha-value>)',
          fg: 'hsl(var(--color-accent-fg) / <alpha-value>)'
        },
        state: {
          success: 'hsl(var(--color-state-success) / <alpha-value>)',
          warn: 'hsl(var(--color-state-warn) / <alpha-value>)',
          danger: 'hsl(var(--color-state-danger) / <alpha-value>)',
          info: 'hsl(var(--color-state-info) / <alpha-value>)'
        }
      },
      spacing: {
        xxs: 'var(--space-xxs)',
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
        '2xl': 'var(--space-2xl)'
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        pill: 'var(--radius-pill)'
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)'
      },
      fontFamily: {
        ui: ['var(--font-ui)'],
        mono: ['var(--font-mono)']
      }
    }
  },
  plugins: []
}
export default config
