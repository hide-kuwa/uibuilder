import { describe, it, expect } from 'vitest'
import { contentHash } from './hash'

describe('contentHash format', () => {
  it('is 64-char lowercase hex', () => {
    const h = contentHash({ x: 1 })
    expect(h).toMatch(/^[0-9a-f]{64}$/)
  })
  it('same content → same hash; different → different', () => {
    expect(contentHash({ a: 1, b: 2 })).toBe(contentHash({ b: 2, a: 1 }))
    expect(contentHash({ a: 1 })).not.toBe(contentHash({ a: 2 }))
  })
})

