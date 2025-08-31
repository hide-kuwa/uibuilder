import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './',
  use: { baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000' },
  reporter: [['list']],
  webServer: process.env.E2E_NO_SERVER ? undefined : {
    command: process.env.E2E_BUILD ? 'pnpm build && pnpm start' : 'pnpm dev',
    port: 3000,
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
})

