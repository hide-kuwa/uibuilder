import { describe, it, expect } from 'vitest'
import { scoreCalc } from './scoreCalc'

describe('scoreCalc threshold sanity', () => {
  it('produces <70 / ==70 / >70 around the gate boundary', () => {
    expect(scoreCalc({ contrast: 'bad', a11y: 0, grid: 0 })).toBeLessThan(70)
    expect(scoreCalc({ contrast: 'ok', a11y: 0, grid: 0 })).toBe(70)
    expect(scoreCalc({ contrast: 'ok', a11y: 5, grid: 0 })).toBeGreaterThan(70)
  })
})

