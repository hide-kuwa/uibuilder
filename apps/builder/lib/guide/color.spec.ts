import { describe, it, expect } from 'vitest'
import { contrastRatioCSS, ensureAAColorPair } from './color'

describe('ensureAAColorPair', () => {
  it('reaches AA(≥4.5) or improves ratio', () => {
    const fg = '#777777', bg = '#ffffff'
    const before = contrastRatioCSS(fg, bg)
    const { fg: fg2, bg: bg2 } = ensureAAColorPair(fg, bg, 4.5)
    const after = contrastRatioCSS(fg2, bg2)
    expect(after).toBeGreaterThanOrEqual(Math.min(4.5, before))
  })
})

