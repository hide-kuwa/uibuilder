import { describe, it, expect } from 'vitest'
import { pairDurations } from './timeline'

describe('gate timeline markers (append-only)', () => {
  it('pairs start/end to durations by label', () => {
    const markers = [
      { label: 'export.zip', phase: 'start', at: 1000 },
      { label: 'export.zip', phase: 'end', at: 1120 },
      { label: 'audit.score', phase: 'start', at: 2000 },
      { label: 'audit.score', phase: 'end', at: 2125 },
    ]
    const rows = pairDurations(markers as any)
    const map = Object.fromEntries(rows.map((r) => [r.label, r.ms]))
    expect(map['export.zip']).toBe(120)
    expect(map['audit.score']).toBe(125)
  })
})

