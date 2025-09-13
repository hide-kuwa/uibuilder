import { describe, it, expect } from 'vitest'
import { migrate } from '@/lib/doc/migrate'
import { DOC_VERSION } from '@/lib/doc/version'

describe('migrate', () => {
  it('upgrades version 0 bundle to DOC_VERSION without throwing', () => {
    const input = { version: 0, doc: { tree: [], components: {}, prototypeLinks: {} }, themes: { foo: 'bar' } }
    const m = migrate(input)
    expect(m.version).toBe(DOC_VERSION)
    expect(Array.isArray(m.notes)).toBe(true)
    expect(m.doc).toBeTruthy()
  })

  it('round-trips export/import structure', () => {
    const doc = { tree: [{ id: 'x' }], components: { a: {} }, prototypeLinks: {} }
    const themes = { color: { primary: '#000' } }
    const m = migrate({ version: 0, doc, themes })
    expect(m.version).toBe(DOC_VERSION)
    expect(m.doc).toEqual(doc)
    expect(m.themes).toEqual(themes)
  })
})

