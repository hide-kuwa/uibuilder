import { describe, it, expect } from 'vitest'
import { stableStringify } from './stableStringify'

describe('stableStringify (arrays & objects)', () => {
  it('object key order-insensitive', () => {
    expect(stableStringify({ a: 1, b: 2 })).toBe(stableStringify({ b: 2, a: 1 }))
  })
  it('array order-sensitive', () => {
    expect(stableStringify([1, 2, 3])).not.toBe(stableStringify([3, 2, 1]))
  })
})

