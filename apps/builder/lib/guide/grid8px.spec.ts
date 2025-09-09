import { describe, it, expect } from 'vitest'
import { calc8pxFit } from './grid8px'

describe('8px grid fit', () => {
  it('perfectly aligned → 100%', () => {
    expect(calc8pxFit([0, 8, 16, 24])).toBe(100)
  })
  it('1px off once → <100%', () => {
    expect(calc8pxFit([0, 9, 16, 24])).toBeLessThan(100)
  })
})

