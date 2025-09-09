import { describe, it, expect } from 'vitest'
import { ensureMinFont, ensureLineHeight } from './font'

describe('font rules', () => {
  it('enforces minimum font size', () => {
    expect(ensureMinFont({ size: 11 }, { min: 12 })).toEqual({ size: 12 })
    expect(ensureMinFont({ size: 12 }, { min: 12 })).toEqual({ size: 12 })
  })
  it('enforces minimum line-height', () => {
    expect(ensureLineHeight({ lh: 1.2 }, { min: 1.4 })).toEqual({ lh: 1.4 })
  })
})

