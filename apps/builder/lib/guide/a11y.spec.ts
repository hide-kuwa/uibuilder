import { describe, it, expect } from 'vitest'
import { scoreA11y } from './a11y'

describe('a11y score', () => {
  it('labels and roles add score', () => {
    expect(scoreA11y({ label: 'Save', role: 'button' })).toBeGreaterThan(0)
  })
  it('missing semantics yields 0', () => {
    expect(scoreA11y({} as any)).toBe(0)
  })
})

