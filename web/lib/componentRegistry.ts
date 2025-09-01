import type { ComponentRegistry, ComponentDef } from '@/types/builder'

export const componentRegistry: ComponentRegistry = {}
export const register = (def: ComponentDef) => {
  componentRegistry[def.meta.id] = def
}

