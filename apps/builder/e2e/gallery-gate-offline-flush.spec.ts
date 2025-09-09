import { test, expect } from '@playwright/test'

const slug = process.env.NEXT_PUBLIC_E2E_SLUG || 'sample'

test('presets→gate(<70)→offline queue→flush→saved', async ({ page, context }) => {
  await page.goto(`/dev/pages/edit?slug=${slug}`)
  await page.waitForLoadState('networkidle')

  // Presets タブ → 最初のプリセットを適用
  const tab = page.getByTestId('tab-presets')
  await tab.click()
  const applyFirst = page.getByTestId('gallery-apply-first')
  await applyFirst.click()

  // Gate（<70）想定：出れば承認、出なければ続行
  const scoreBadge = page.getByTestId('score-badge')
  const sAttr = await scoreBadge.getAttribute('data-score').catch(() => null)
  const score = sAttr ? Number(sAttr) : NaN
  if (!Number.isNaN(score) && score < 70) {
    const gate = page.getByTestId('change-gate-approve')
    try { await gate.waitFor({ state: 'visible', timeout: 2000 }); await gate.click() } catch {}
  }

  // オフライン → 何か変更を積む（binding-apply を再利用）
  await context.setOffline(true)
  const bind = page.getByTestId('binding-apply')
  if (await bind.isVisible()) await bind.click()

  // SaveBadge の queued/offline/saving いずれか
  const badge = page.getByTestId('save-badge')
  await expect(badge).toBeVisible()
  const offlineStates = new Set(['queued', 'offline', 'saving'])
  await expect.poll(async () => await badge.getAttribute('data-state'), {
    message: 'offline/queued への遷移を待機',
    intervals: [150, 300, 600],
    timeout: 5000,
  }).toSatisfy((s) => !!s && offlineStates.has(s as any))

  // オンライン復帰 → saved へ
  await context.setOffline(false)
  await expect.poll(async () => await badge.getAttribute('data-state'), {
    message: 'flush 完了（saved 到達）を待機',
    intervals: [200, 300, 500, 800, 1200],
    timeout: 20000,
  }).toBe('saved')

  // Outbox 長さの増減も併せて確認（0→>0→0）
  await expect.poll(async () => await badge.getAttribute('data-outbox')).not.toBe('0')
  await expect.poll(async () => await badge.getAttribute('data-outbox')).toBe('0')
})
