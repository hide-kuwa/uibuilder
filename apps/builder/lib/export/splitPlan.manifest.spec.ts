import { describe, it, expect } from 'vitest'
import { toSplitManifest, partName } from './splitPlan'

describe('splitPlan manifest (append-only)', () => {
  it('names parts deterministically and builds manifest', () => {
    const parts = [{ size: 1024 }, { size: 2048 }, { size: 512 }]
    const m = toSplitManifest(parts as any)
    expect(m.totalSize).toBe(3584)
    expect(m.parts.map((p: any) => p.name)).toEqual([
      partName(0, 1024),
      partName(1, 2048),
      partName(2, 512),
    ])
  })
})

