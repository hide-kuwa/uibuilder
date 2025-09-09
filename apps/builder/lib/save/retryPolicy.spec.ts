import { describe, it, expect } from 'vitest'
import { nextDelay } from './retryPolicy'

describe('retryPolicy', () => {
  it('exponential backoff with cap', () => {
    expect(nextDelay(1, { base: 100, factor: 2, cap: 500 })).toBe(100)
    expect(nextDelay(2, { base: 100, factor: 2, cap: 500 })).toBe(200)
    expect(nextDelay(3, { base: 100, factor: 2, cap: 500 })).toBe(400)
    expect(nextDelay(4, { base: 100, factor: 2, cap: 500 })).toBe(500) // capped
  })
})

