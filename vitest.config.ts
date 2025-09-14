/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: [
      '**/*.{test,spec}.{ts,tsx}',
      'apps/**/*.{test,spec}.{ts,tsx}',
      'web/tests/**/*.spec.{ts,tsx}',
      'web/**/__tests__/**/*.{ts,tsx}',
    ],
  },
})