import { test, expect } from '@playwright/test'

test('palette drag & drop inserts a node', async ({ page }) => {
  await page.goto('/builder?slug=demo')
  await expect(page.getByTestId('palette-item-text')).toBeVisible()
  await page.dragAndDrop('[data-testid="palette-item-text"]', '[data-testid="canvas-root"]')
  await expect(page.locator('[data-node-type="text"]')).toHaveCount(1)
})
