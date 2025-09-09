// apps/builder/lib/presets/registry.ts
import type { Preset } from './types'

export async function getPreset(name: string): Promise<Preset | null> {
  try {
    const r = await fetch(`/presets/${encodeURIComponent(name)}.json`, { cache: 'no-store' })
    if (!r.ok) return null
    const j = (await r.json()) as Preset
    return j
  } catch {
    return null
  }
}

export async function getPresetNames(): Promise<string[]> {
  try {
    const r = await fetch('/presets/index.json', { cache: 'no-store' })
    if (!r.ok) return []
    const j = (await r.json()) as { names?: string[] }
    return Array.isArray(j?.names) ? j.names : []
  } catch {
    return []
  }
}

