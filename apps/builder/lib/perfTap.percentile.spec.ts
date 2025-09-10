import { describe, it, expect } from 'vitest'
import { percentile } from './perfTap'

describe('percentile()', () => {
  it('returns p95 near the upper tail', () => {
    const xs = [1, 2, 3, 4, 5, 100]
    const p95 = percentile(xs, 95)
    expect(p95).toBeGreaterThanOrEqual(5)
    expect(p95).toBeLessThanOrEqual(100)
  })
  it('handles empty input', () => {
    expect(percentile([], 95)).toBe(0)
  })
})

