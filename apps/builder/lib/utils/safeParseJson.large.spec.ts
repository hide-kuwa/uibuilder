import { describe, it, expect } from 'vitest'
import { safeParseJson } from './safeParseJson'

describe('safeParseJson (large or invalid)', () => {
  it('returns fallback on invalid huge string', () => {
    const big = '{' + 'x:'.repeat(10000) + '}' // broken JSON
    const fb = { ok: true }
    expect(safeParseJson(big, fb)).toEqual(fb)
  })
})

