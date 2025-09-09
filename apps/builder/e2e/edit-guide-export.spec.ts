import { test, expect } from '@playwright/test'

test('Edit→Guide修正→Save→Export', async ({ page }) => {
  await page.goto('/dev/pages/edit?slug=sample')

  // タイトルを編集（メタ保存のスモーク）
  const title = page.getByLabel('Title')
  if (await title.isVisible()) {
    await title.fill('Sample Page v2')
  }

  // Guide タブ → 最初の「修正」
  // タブ登録方式によってはクリック不要で表示されている可能性があるため安全に
  const guideTab = page.getByRole('tab', { name: /Guide/i })
  if (await guideTab.isVisible()) await guideTab.click()
  const fix = page.getByRole('button', { name: '修正' }).first()
  await fix.click()

  // SaveBadge: Queue 表示（オンラインなら時刻、オフなら Queue>0）
  await expect(page.locator('text=Queue:')).toBeVisible()

  // UI-Audit スコアや Issues テキストが見えること（スモーク）
  await expect(page.getByText(/UI-Audit/i)).toBeVisible()

  // Export ボタン → zip レスポンス（ダウンロードトリガ）
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Export' }).click(),
  ])
  const path = await download.path()
  expect(path).toBeTruthy()
})

