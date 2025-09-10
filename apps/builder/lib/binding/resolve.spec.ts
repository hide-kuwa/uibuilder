import { describe, it, expect } from 'vitest'
import { resolveBinding } from './simpleResolve'

describe('binding resolve (simple)', () => {
  const item = { price: 0, active: false, note: null }
  it('handles item.* and falsy values', () => {
    expect(resolveBinding('item.price', { item })).toBe(0)
    expect(resolveBinding('item.active', { item })).toBe(false)
    expect(resolveBinding('item.note', { item })).toBeNull()
  })
  it('fallback on missing with ??', () => {
    expect(resolveBinding('item.missing ?? 123', { item })).toBe(123)
  })
})
