import { describe, it, expect } from 'vitest'
import { deepGet } from './deepGet'

describe('deepGet (safe)', () => {
  const obj = { a: { b: [{ c: 1 }] } }
  it('reads dot/bracket path', () => {
    expect(deepGet(obj, 'a.b[0].c')).toBe(1)
  })
  it('blocks proto keys', () => {
    expect(deepGet(obj, '__proto__.polluted')).toBeUndefined()
  })
  it('returns undefined for missing', () => {
    expect(deepGet(obj, 'x.y')).toBeUndefined()
  })
})

