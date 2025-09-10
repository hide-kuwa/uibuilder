import { describe, it, expect } from 'vitest'
import { deepOmit } from './deepOmit'

describe('deepOmit', () => {
  const src = { a: { b: [{}, { c: 1, d: 0 }], keep: true }, e: false, f: null } as any
  it('removes exact paths without creating or nuking siblings', () => {
    const out = deepOmit(src, ['a.b[1].c', 'f'])
    expect(out).toEqual({ a: { b: [{}, { d: 0 }], keep: true }, e: false })
    // 元は不変
    expect(src.a.b[1].c).toBe(1)
    expect(src.f).toBeNull()
  })
})

