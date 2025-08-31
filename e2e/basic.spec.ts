import { test, expect } from '@playwright/test'

function b64u(s: string) {
  const b64 = Buffer.from(s, 'utf8').toString('base64')
  return b64.replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')
}

test('builder header renders', async ({ page }) => {
  await page.goto('/builder')
  await expect(page.getByText('Builder')).toBeVisible()
})

test('preview renders shared project', async ({ page }) => {
  const data = {
    schemaVersion: 1,
    createdAt: Date.now(),
    meta: {},
    elements: [
      { id: 't1', type: 'instance', componentId: 'ui.text', x: 40, y: 40, w: 200, h: 24, propValues: { text: 'Hello Preview', size: 'xl' } }
    ],
  }
  const url = '/preview?d=' + b64u(JSON.stringify(data))
  await page.goto(url)
  await expect(page.getByText('Hello Preview')).toBeVisible()
})

