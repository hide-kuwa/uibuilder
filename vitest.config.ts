import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['apps/builder/lib/**/*.spec.ts'],
    environment: 'node',
  },
})

