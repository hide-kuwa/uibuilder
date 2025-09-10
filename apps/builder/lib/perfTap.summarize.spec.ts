import { describe, it, expect } from 'vitest'
import { summarizeP95 } from './perfTap'

;(globalThis as any).window = {} as any

describe('summarizeP95', () => {
  it('groups by label and returns p50/p95/max', () => {
    ;(window as any).__perf = [
      { label: 'A', ms: 10, t: 0 },
      { label: 'A', ms: 20, t: 0 },
      { label: 'B', ms: 5, t: 0 },
    ]
    const rows = summarizeP95()
    const a = rows.find((r) => r.label === 'A')!
    const b = rows.find((r) => r.label === 'B')!
    expect(a.count).toBe(2)
    expect(a.p95).toBeGreaterThanOrEqual(a.p50)
    expect(b.count).toBe(1)
    expect(b.max).toBe(5)
  })
})

