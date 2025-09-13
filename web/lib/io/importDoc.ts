import { migrate, type Migrated } from '@/lib/doc/migrate'

export type ImportMode = 'overwrite' | 'merge'

export async function parseImportText(text: string): Promise<Migrated> {
  let parsed: any
  try { parsed = JSON.parse(text) } catch { parsed = null }
  if (!parsed || typeof parsed !== 'object') throw new Error('Invalid import JSON')
  return migrate(parsed)
}

export async function importDocFromFile(file: File, mode: ImportMode = 'overwrite'): Promise<Migrated> {
  const text = await file.text()
  const m = await parseImportText(text)
  await applyImported(m, mode)
  return m
}

export async function applyImported(m: Migrated, mode: ImportMode): Promise<void> {
  try {
    // @ts-expect-error runtime probing
    const io = (window as any).__io
    if (!io) return
    if (m.doc && io.applyImportedDoc) await io.applyImportedDoc(m.doc, mode)
    if (typeof m.themes !== 'undefined' && io.applyImportedThemes) await io.applyImportedThemes(m.themes, mode)
  } catch {}
}

