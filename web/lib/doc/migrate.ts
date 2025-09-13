import { DOC_VERSION } from '@/lib/doc/version'

export type DocBundle = { version?: number; doc?: any; themes?: any }
export type Migrated = { version: number; doc: any; themes?: any; notes: string[] }

/**
 * Thin, forward-only migrator. Unknown inputs default to version 0.
 */
export function migrate(input: DocBundle | any): Migrated {
  const src: DocBundle = (input && typeof input === 'object' ? input : { doc: input })
  let curr = Number.isFinite(src.version as any) ? Number(src.version) : 0
  const notes: string[] = []
  let doc = src.doc ?? input
  let themes = src.themes

  // Stepwise upgrade until DOC_VERSION
  while (curr < DOC_VERSION) {
    switch (curr) {
      case 0: {
        // v0 -> v1: no-op structure bump (placeholder for future rules)
        notes.push('migrate: 0 -> 1 (no-op)')
        curr = 1
        break
      }
      default: {
        // Safety: jump to target
        notes.push(`migrate: ${curr} -> ${DOC_VERSION} (fast-forward)`) 
        curr = DOC_VERSION
        break
      }
    }
  }

  return { version: curr, doc, themes, notes }
}

