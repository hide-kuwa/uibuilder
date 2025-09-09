import { describe, it, expect } from 'vitest'
import { stableStringify } from './stableStringify'

describe('stableStringify', () => {
  it('ignores object key order', () => {
    const s1 = stableStringify({ a: 1, b: 2 })
    const s2 = stableStringify({ b: 2, a: 1 })
    expect(s1).toBe(s2)
  })
  it('differs on value changes', () => {
    expect(stableStringify({ a: 1 })).not.toBe(stableStringify({ a: 2 }))
  })
})

