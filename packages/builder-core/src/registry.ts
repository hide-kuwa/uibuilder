import type { ComponentRegistry, ComponentDef } from '@repo/types'

export const componentRegistry: ComponentRegistry = {}
export const register = (def: ComponentDef) => {
  componentRegistry[def.meta.id] = def
}

