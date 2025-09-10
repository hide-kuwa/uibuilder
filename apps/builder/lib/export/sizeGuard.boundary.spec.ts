import { describe, it, expect } from 'vitest'
import { sizeGuardOk } from './sizeGuard'
import { contentHashBytes } from './hash'

describe('sizeGuard boundary & hash bytes (append-only)', () => {
  it('2MB threshold behavior', () => {
    const MB = 1024 * 1024
    expect(sizeGuardOk(2 * MB - 1)).toBe(true)
    expect(sizeGuardOk(2 * MB)).toBe(true) // 現仕様: <= 2MB OK
    expect(sizeGuardOk(2 * MB + 1)).toBe(false)
  })
  it('contentHashBytes is deterministic for same input', () => {
    const buf = new Uint8Array([1, 2, 3, 4])
    const a = contentHashBytes(buf)
    const b = contentHashBytes(buf)
    expect(a).toBe(b)
    expect(a).toMatch(/^[a-f0-9]{64}$/)
  })
})

