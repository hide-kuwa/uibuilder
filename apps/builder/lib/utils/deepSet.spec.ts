import { describe, it, expect } from 'vitest'
import { deepSet } from './deepSet'

describe('deepSet', () => {
  it('creates nested arrays/objects safely', () => {
    const o: any = {}
    deepSet(o, 'a.b[2].c', 42)
    expect(o.a.b[2].c).toBe(42)
  })
  it('overwrites existing without nuking siblings', () => {
    const o: any = { a: { b: [{}, { d: 1 }] } }
    deepSet(o, 'a.b[1].d', 2)
    expect(o.a.b[1].d).toBe(2)
  })
})

