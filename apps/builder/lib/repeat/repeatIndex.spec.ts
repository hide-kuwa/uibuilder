import { describe, it, expect } from 'vitest'
import { deriveIndexes } from './repeatIndex'

describe('repeat index stability', () => {
  it('0/1/N are contiguous and stable', () => {
    expect(deriveIndexes([])).toEqual([])
    expect(deriveIndexes(['x'])).toEqual([0])
    expect(deriveIndexes(['a', 'b', 'c'])).toEqual([0, 1, 2])
  })
  it('wrap/unwrap preserves order', () => {
    const before = ['a', 'b']
    const wrapped = ['a', 'b', '_wrap_']
    expect(deriveIndexes(before)).toEqual([0, 1])
    expect(deriveIndexes(wrapped)).toEqual([0, 1, 2])
  })
})

