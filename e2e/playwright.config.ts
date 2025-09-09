import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './',
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,\n    trace: 'retain-on-failure',\n    screenshot: 'only-on-failure',\n    video: 'retain-on-failure',
  },
  projects: [{ name: 'chromium' }],\n  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],,
  timeout: 60_000,
})


