import { describe, it, expect } from 'vitest'
import { deepMerge } from './deepMerge'

describe('deepMerge', () => {
  it('merges nested objects without clobbering', () => {
    expect(deepMerge({ a: { b: 1 } }, { a: { c: 2 } })).toEqual({ a: { b: 1, c: 2 } })
  })
  it('arrays concat', () => {
    expect(deepMerge({ a: [1] }, { a: [2] })).toEqual({ a: [1, 2] })
  })
})

