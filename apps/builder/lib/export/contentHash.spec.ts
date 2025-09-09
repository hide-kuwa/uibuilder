import { describe, it, expect } from 'vitest'
import { contentHash } from './hash'

describe('contentHash', () => {
  it('same data, different key order → same hash', () => {
    const a = { x: 1, y: 2 }, b = { y: 2, x: 1 }
    expect(contentHash(a)).toBe(contentHash(b))
  })
  it('different data → different hash', () => {
    expect(contentHash({ x: 1 })).not.toBe(contentHash({ x: 2 }))
  })
})

