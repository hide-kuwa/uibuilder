// apps/builder/lib/nodes/factory.compat.ts
import type { ComponentNode, JSONSchema } from '@chizu/types'

function generateNodeId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID()
    } catch {}
  }
  return `node-${Math.random().toString(36).slice(2, 10)}`
}

function extractDefaultProps(schema: JSONSchema | undefined): Record<string, any> {
  if (!schema || typeof schema !== 'object') return {}
  const props = schema.properties ?? {}
  const defaults: Record<string, any> = {}
  Object.entries(props).forEach(([key, spec]) => {
    if (spec && typeof spec === 'object' && 'default' in spec && spec.default !== undefined) {
      defaults[key] = spec.default
    }
  })
  return defaults
}

export function createNodeFromDef(def: any, _opts?: { slotKey?: string }): ComponentNode {
  const id = generateNodeId()
  const type = typeof def?.id === 'string' ? def.id : typeof def?.componentId === 'string' ? def.componentId : 'div'
  const defaults = extractDefaultProps(def?.propsSchema as JSONSchema | undefined)
  const props = Object.keys(defaults).length ? defaults : undefined

  return {
    id,
    type,
    props,
    children: [],
  }
}
