import { describe, it, expect } from 'vitest'
import { planZipSplit } from './splitPlan'

const mb = (n: number) => n * 1024 * 1024

describe('planZipSplit', () => {
  it('keeps one part at or under limit', () => {
    const files = [
      { path: 'a.json', size: mb(1.2) },
      { path: 'b.json', size: mb(0.7) },
    ]
    expect(planZipSplit(files as any, mb(2))).toEqual([[files[0], files[1]]])
  })
  it('splits when crossing limit (greedy, stable)', () => {
    const files = [
      { path: 'a.json', size: mb(1.3) },
      { path: 'b.json', size: mb(0.9) },
      { path: 'c.json', size: mb(0.6) },
    ]
    const parts = planZipSplit(files as any, mb(2))
    expect(parts.length).toBe(2)
    expect(parts[0].map((f) => f.path)).toEqual(['a.json'])
    expect(parts[1].map((f) => f.path)).toEqual(['b.json', 'c.json'])
  })
})

