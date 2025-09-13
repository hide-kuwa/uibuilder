import { describe, it, expect } from 'vitest'
import { isColorLike, isPxLike } from './tokenValidators'

describe('tokenValidators', () => {
  it('isColorLike detects hex, rgba, hsl, var, linear-gradient', () => {
    expect(isColorLike('#fff')).toBe(true)
    expect(isColorLike('#fffa')).toBe(true)
    expect(isColorLike('#ffffff')).toBe(true)
    expect(isColorLike('rgba(0,0,0,0.5)')).toBe(true)
    expect(isColorLike('hsl(0, 0%, 0%)')).toBe(true)
    expect(isColorLike('oklch(0.5 0.1 90)')).toBe(true)
    expect(isColorLike('var(--color)')).toBe(true)
    expect(isColorLike('linear-gradient(90deg, #fff, #000)')).toBe(true)
    expect(isColorLike('not-a-color')).toBe(false)
  })

  it('isPxLike detects px/rem/em/%', () => {
    expect(isPxLike('8px')).toBe(true)
    expect(isPxLike('1.5rem')).toBe(true)
    expect(isPxLike('2em')).toBe(true)
    expect(isPxLike('50%')).toBe(true)
    expect(isPxLike('12')).toBe(false)
  })
})

