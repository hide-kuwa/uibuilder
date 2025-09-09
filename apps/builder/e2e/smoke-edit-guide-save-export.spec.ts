import { test, expect } from '@playwright/test'

const slug = process.env.NEXT_PUBLIC_E2E_SLUG || 'sample'

test('edit→guide→save→export', async ({ page }) => {
  await page.goto(`/dev/pages/edit?slug=${slug}`)
  await page.waitForLoadState('networkidle')

  // Guide 修正 → Diff 承認（実際は Copy .diff に乗せた testid）
  const apply = page.getByTestId('guide-contrast-apply').first()
  await apply.click()
  const approve = page.getByTestId('diff-approve')
  if (await approve.isVisible()) await approve.click()

  // SaveBadge が見える（Queue/時刻のどちらか）
  await expect(page.getByTestId('save-badge')).toBeVisible()

  // Export ボタン → zip レスポンス
  const [resp] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/exports.zip/') && r.status() === 200),
    page.getByTestId('export-button').click(),
  ])
  expect(resp.ok()).toBeTruthy()
})
