import { describe, it, expect } from 'vitest'
import { buildZipManifest } from './zipManifest'
import { stableStringify } from './stableStringify'
import { contentHash } from './hash'

describe('zipManifest', () => {
  it('includes path, size, and content hash (order-stable)', () => {
    const files = [
      { path: 'a.json', data: { x: 1, y: 2 } },
      { path: 'b.json', data: { list: [3, 2, 1] } },
    ]
    const man = buildZipManifest(files)
    expect(man).toHaveLength(2)
    const a = man.find((m) => m.path === 'a.json')!
    expect(a.size).toBe(stableStringify({ x: 1, y: 2 }).length)
    expect(a.hash).toBe(contentHash({ x: 1, y: 2 }))
  })

  it('is deterministic regardless of input order', () => {
    const m1 = buildZipManifest([
      { path: 'a.json', data: { a: 1 } },
      { path: 'b.json', data: { b: 2 } },
    ])
    const m2 = buildZipManifest([
      { path: 'b.json', data: { b: 2 } },
      { path: 'a.json', data: { a: 1 } },
    ])
    expect(m1).toEqual(m2)
  })
})

