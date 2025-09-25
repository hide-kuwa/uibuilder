import { test, expect, type Locator, type Page } from '@playwright/test'

async function firstVisible(page: Page, selectors: string[]): Promise<Locator | null> {
  for (const selector of selectors) {
    const candidate = page.locator(selector).first()
    if ((await candidate.count()) === 0) continue
    try {
      if (await candidate.isVisible()) return candidate
    } catch (err) {
      // fall back to bounding box to allow detached-but-visible nodes
      const box = await candidate.boundingBox()
      if (box) return candidate
    }
  }
  return null
}

test('palette drag→preview persistence', async ({ page }) => {
  await page.goto('/builder')
  await page.waitForLoadState('networkidle')

  const paletteTab = await firstVisible(page, [
    '[data-tab="palette"]',
    '[data-testid="tab-palette"]',
    '[data-panel-id="palette"]',
    '[data-panel="palette"]',
  ])
  if (paletteTab) await paletteTab.click()

  const paletteItem = await firstVisible(page, [
    '[data-palette-item="ui.button"]',
    '[data-palette-item="button"]',
    '[data-component-id="ui.button"]',
    '[data-testid="palette-item-button"]',
    '[data-registry-id="ui.button"]',
    '[data-testid="palette-item-ui.button"]',
    '[title="ui.button"]',
  ])
  if (!paletteItem) throw new Error('Palette item for Button not found')

  const slotRoot = await firstVisible(page, [
    '[data-slot="main"]',
    '[data-slot="content"]',
    '[data-slot="root"]',
    '[data-builder-slot="main"]',
    '[data-canvas-root]',
  ])
  if (!slotRoot) throw new Error('Main slot not found')

  const slot = slotRoot
  let dropTarget = slot.locator('[data-drop-sep]').first()
  if ((await dropTarget.count()) === 0) {
    dropTarget = slot
  }

  const nodes = slot.locator('[data-node-id]')
  const before = await nodes.count()

  await paletteItem.dragTo(dropTarget)

  await expect(nodes).toHaveCount(before + 1)

  const exportButton = await firstVisible(page, [
    '[data-testid="export-project"]',
    '[data-export="project"]',
    '[data-export="json"]',
    'button[data-export]',
  ])
  if (exportButton) {
    await exportButton.click()
  }

  await page.goto('/preview')
  await page.waitForLoadState('networkidle')

  const previewButton = page.locator('[data-node-id]:has-text("Button")').first()
  await expect(previewButton).toBeVisible()
})
