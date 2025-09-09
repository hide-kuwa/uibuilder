import { describe, it, expect } from 'vitest'
import { safeParseJson } from './safeParseJson'

describe('safeParseJson', () => {
  it('parses valid JSON', () => {
    expect(safeParseJson('{"a":1}', { a: 0 })).toEqual({ a: 1 })
  })
  it('returns fallback on invalid', () => {
    expect(safeParseJson('{oops}', { a: 0 } as any)).toEqual({ a: 0 })
  })
})

