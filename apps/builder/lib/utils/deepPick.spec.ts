import { describe, it, expect } from 'vitest'
import { deepPick } from './deepPick'

describe('deepPick', () => {
  const obj = { a: { b: [{}, { c: 1, d: 0 }] }, e: false, f: null } as any
  it('picks nested paths without creating missing branches', () => {
    const out = deepPick(obj, ['a.b[1].c', 'e', 'f'])
    expect(out).toEqual({ a: { b: [{}, { c: 1 }] }, e: false, f: null })
  })
})

