import { describe, it, expect } from 'vitest'
import { deepOmit } from './deepOmit'

describe('deepOmit (extra)', () => {
  const src = { a: { b: [{}, { c: 1, d: 0 }], keep: true }, e: false, f: null } as any
  it('removes multiple paths and keeps siblings', () => {
    const out = deepOmit(src, ['a.b[1].c', 'e', 'not.exists'])
    expect(out).toEqual({ a: { b: [{}, { d: 0 }], keep: true }, f: null })
    // src is unchanged
    expect(src.a.b[1].c).toBe(1)
  })
})

