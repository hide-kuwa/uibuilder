import type { ComponentDef } from '@/types/builder'
import { componentRegistry, register as registerNew } from './componentRegistry'
import paletteLabels from '@/config/paletteLabels'

export type RegistryItem = ComponentDef

export const registry: Record<string, ComponentDef> = componentRegistry

export function register(item: RegistryItem) {
  registerNew(item)
}

export function getDef(key: string): RegistryItem | undefined {
  return registry[key]
}

export function listDefs(): Array<{ key: string; label: string }> {
  // Legacy support for palette expecting key/label, with label overrides
  return Object.values(registry).map((d) => ({
    key: d.meta.id,
    label: paletteLabels[d.meta.id] ?? d.meta.displayName,
  }))
}

export function listComponentOptions() {
  return Object.values(registry).map((r) => ({
    key: r.meta.id,
    label: r.meta.displayName,
    group: r.meta.group,
  }))
}
