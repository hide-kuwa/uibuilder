import { describe, it, expect } from 'vitest'
import { toCsv } from './perfTap'

describe('perfTap CSV format', () => {
  it('uses comma as delimiter and stable header order', () => {
    const rows = [
      { label: 'audit.score', p95: 120, os: 'ubuntu', runId: '123' },
      { label: 'export.zip', p95: 130, os: 'windows', runId: '123' },
    ]
    const csv = toCsv(rows)
    const lines = csv.trim().split('\n')
    expect(lines[0]).toBe('label,p95,os,runId')
    expect(lines[1]).toContain('audit.score,120,ubuntu,123')
    expect(lines[2]).toContain('export.zip,130,windows,123')
  })
})

