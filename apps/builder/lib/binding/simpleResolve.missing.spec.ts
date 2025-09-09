import { describe, it, expect } from 'vitest'
import { resolveBinding, simpleResolve } from './simpleResolve'

describe('simpleResolve missing vs nullish-coalesce', () => {
  const ctx = { item: { n: 0, f: false } }
  it('missing path → undefined', () => {
    expect(resolveBinding('item.missing', ctx as any)).toBeUndefined()
    expect(simpleResolve('item.missing', ctx as any)).toBeUndefined()
  })
  it('missing with ?? fallback → fallback value', () => {
    expect(resolveBinding('item.missing ?? 42', ctx as any)).toBe(42)
    expect(simpleResolve('item.missing ?? 42', ctx as any)).toBe(42)
  })
})

