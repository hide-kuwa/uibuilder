import { describe, it, expect } from 'vitest'
import { resolveBinding } from './simpleResolve'

describe('simpleResolve nullish fallback', () => {
  const item = { zero: 0, nope: false, empty: null }
  it('keeps falsy values (0/false) but falls back on null/undefined', () => {
    expect(resolveBinding('item.zero ?? 123', { item })).toBe(0)
    expect(resolveBinding('item.nope ?? "x"', { item })).toBe(false)
    expect(resolveBinding('item.empty ?? "x"', { item })).toBe('x')
  })
})

