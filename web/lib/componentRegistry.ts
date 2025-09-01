import type { ComponentDef } from '@/types/builder'

// New-style registry (ComponentMeta/Render) for editor/runtime packs
export const componentRegistry: Record<string, ComponentDef> = {}
export const register = (def: ComponentDef) => {
  componentRegistry[def.meta.id] = def
}

// Convenience alias so callers that import { registry } still work
export const registry = componentRegistry
