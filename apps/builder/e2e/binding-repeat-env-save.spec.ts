import { test, expect } from '@playwright/test'

const slug = process.env.NEXT_PUBLIC_E2E_SLUG || 'sample'

test('binding→repeat→env→save', async ({ page, context }) => {
  await page.goto(`/dev/pages/edit?slug=${slug}`)
  await page.waitForLoadState('networkidle')

  // Binding を1つ適用
  const bind = page.getByTestId('binding-apply')
  if (await bind.isVisible()) await bind.click()

  // Repeat wrap → unwrap
  const items = page.getByTestId('repeat-item')
  const before = await items.count().catch(() => 0)
  const wrap = page.getByTestId('repeat-wrap')
  if (await wrap.isVisible()) {
    await wrap.click()
    await expect(items).toHaveCount(before + 1)
  }
  const unwrap = page.getByTestId('repeat-unwrap')
  if (await unwrap.isVisible()) {
    await unwrap.click()
    await expect(items).toHaveCount(before)
  }

  // Env: mock -> live -> mock（Liveが {} でも落ちない前提）
  const env = page.getByTestId('env-toggle')
  await env.click(); await page.waitForTimeout(80); await expect(env).toHaveAttribute('data-env','live')
  await env.click(); await page.waitForTimeout(80); await expect(env).toHaveAttribute('data-env','mock')

  // 保存バッジが可視
  await expect(page.getByTestId('save-badge')).toBeVisible()
})
