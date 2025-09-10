import { describe, it, expect } from 'vitest'
import { buildZipManifestUnique } from './zipManifest'
import { contentHash } from './hash'

describe('zipManifest (dedupe)', () => {
  it('last-wins on duplicate paths, deterministic', () => {
    const files = [
      { path: 'a.json', data: { x: 1 } },
      { path: 'a.json', data: { x: 2 } }, // duplicate
      { path: 'b.json', data: { y: 3 } },
    ]
    const man = buildZipManifestUnique(files)
    expect(man.map((m) => m.path)).toEqual(['a.json', 'b.json']) // deduped
    expect(man.find((m) => m.path === 'a.json')!.hash).toBe(contentHash({ x: 2 }))
  })
})

