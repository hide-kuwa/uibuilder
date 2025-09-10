import { describe, it, expect } from 'vitest'
import { nextDelay, withJitter } from './retryPolicy'

describe('retryPolicy jitter', () => {
  it('adds bounded jitter without changing scale', () => {
    const base = nextDelay(3, { base: 100, factor: 2, cap: 1000 }) // 400
    const j = withJitter(base, { jitter: 0.2 }) // ±20%
    expect(j).toBeGreaterThanOrEqual(320)
    expect(j).toBeLessThanOrEqual(480)
  })
})

