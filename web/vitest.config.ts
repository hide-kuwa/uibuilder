/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: [
      'web/tests/**/*.spec.{ts,tsx}',
      'web/**/__tests__/**/*.{ts,tsx}',
    ],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/e2e/**',
      '**/*.e2e.{ts,tsx}',
      '**/*.cy.{ts,tsx}',
    ],
    setupFiles: [],
  },
})

