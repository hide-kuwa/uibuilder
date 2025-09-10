import { describe, it, expect } from 'vitest'
import { sizeGuardOk } from './sizeGuard'

const B = (n: number) => n

describe('sizeGuard edges', () => {
  it('just under limit passes (2MB - 1B)', () => {
    expect(sizeGuardOk(B(2 * 1024 * 1024 - 1))).toBe(true)
  })
  it('exactly at limit passes (2MB)', () => {
    expect(sizeGuardOk(B(2 * 1024 * 1024))).toBe(true)
  })
  it('just over limit blocks (2MB + 1B)', () => {
    expect(sizeGuardOk(B(2 * 1024 * 1024 + 1))).toBe(false)
  })
})

