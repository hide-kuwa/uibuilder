import { test, expect } from '@playwright/test'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { test as base } from '@playwright/test'

// spec内ユーティリティ（独立動作のために再掲）
function percentile(values: number[], p: number) {
  if (!values.length) return 0
  const arr = [...values].sort((a, b) => a - b)
  const idx = Math.max(0, Math.min(arr.length - 1, Math.ceil((p / 100) * arr.length) - 1))
  return arr[idx]
}
async function p95Of(page: any, label: string) {
  const list = await page.evaluate((lab) => {
    // @ts-ignore
    const perf = (window as any).__perf || []
    return perf.filter((e: any) => e.label === lab).map((e: any) => e.ms)
  }, label)
  return percentile(list, 95)
}

const slug = process.env.NEXT_PUBLIC_E2E_SLUG || 'sample'

test('M6 DoD: P95 thresholds met', async ({ page }) => {
  await page.goto(`/dev/pages/edit?slug=${slug}&env=mock&perfPanel=1`)
  await page.waitForLoadState('networkidle')

  // 1) audit.score を数回（Guide適用→承認）
  for (let i = 0; i < 3; i++) {
    await page.getByTestId('guide-contrast-apply').click()
    await page.getByTestId('diff-modal').waitFor({ state: 'visible' })
    await page.getByTestId('diff-approve').click()
  }

  // 2) preset.apply（Gateが出たら承認）
  await page.getByTestId('tab-presets').click()
  for (let i = 0; i < 3; i++) {
    const low = await page.getByTestId('gallery-apply-first-low').first().catch(() => null as any)
    if (low) await low.click()
    else await page.getByTestId('gallery-apply-first').click()
    const gate = page.getByTestId('change-gate-approve')
    try {
      await gate.waitFor({ state: 'visible', timeout: 1000 })
      await gate.click()
    } catch {}
  }

  // 3) export.zip を2回
  for (let i = 0; i < 2; i++) {
    const [resp] = await Promise.all([
      page.waitForResponse((r) => r.url().includes('/api/exports.zip/') && r.status() === 200),
      page.getByTestId('export-button').click(),
    ])
    expect(resp.ok()).toBeTruthy()
  }

  // ---- P95 判定（DoD） ----
  const p95Score = await p95Of(page, 'audit.score')
  const p95Preset = await p95Of(page, 'preset.apply')
  const p95Export = await p95Of(page, 'export.zip')

  expect(p95Score).toBeLessThan(150)
  expect(p95Preset).toBeLessThan(150)
  expect(p95Export).toBeLessThan(150)
})

// ---- Append-only: save __perf raw CSV per test for CI artifacts ----
base.afterEach(async ({ page }, testInfo) => {
  try {
    const rows = await page.evaluate(() => {
      const perf = (window as any).__perf || []
      return perf.map((e: any) => `${e.label},${e.ms},${e.t}`).join('\n')
    })
    const out = testInfo.outputPath('perf_raw.csv')
    await fs.mkdir(path.dirname(out), { recursive: true })
    await fs.writeFile(out, rows, 'utf8')
    await testInfo.attach('perf_raw.csv', { path: out, contentType: 'text/csv' })
  } catch {}
})

