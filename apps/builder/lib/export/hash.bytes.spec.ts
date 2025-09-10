import { describe, it, expect } from 'vitest'
import { contentHashBytes } from './hash'

describe('contentHashBytes', () => {
  it('hashes Uint8Array deterministically', () => {
    const a = new Uint8Array([1, 2, 3])
    const b = new Uint8Array([1, 2, 3])
    const c = new Uint8Array([3, 2, 1])
    expect(contentHashBytes(a)).toBe(contentHashBytes(b))
    expect(contentHashBytes(a)).not.toBe(contentHashBytes(c))
  })
})

