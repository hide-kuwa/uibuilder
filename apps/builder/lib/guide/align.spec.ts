import { describe, it, expect } from 'vitest'
import { isAligned } from './align'

describe('align tolerance', () => {
  it('within tolerance → true', () => {
    expect(isAligned([0, 1, 0], { tol: 1 })).toBe(true)
  })
  it('beyond tolerance → false', () => {
    expect(isAligned([0, 3, 0], { tol: 1 })).toBe(false)
  })
})

