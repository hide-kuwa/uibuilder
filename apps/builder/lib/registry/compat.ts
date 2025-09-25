// apps/builder/lib/registry/compat.ts
import { entries } from '@chizu/registry'

export type PaletteComponentDef = Record<string, any>

export function getComponentDef(id: string): PaletteComponentDef | null {
  const def = (entries as Record<string, any>)[id]
  return def ?? null
}
