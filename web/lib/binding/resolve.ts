import type { ComponentNode, ComponentProp } from '@/types/editor'

export type BindingSource = {
  id: string
  kind: 'const' | 'json' | 'expr'
  value: any
}

export type Binding = {
  nodeId: string
  prop: string
  sourceId: string
  path?: string
}

// Resolve data bindings for a node's props
export function resolveBinding(
  nodeProps: Record<string, any>,
  bindings: Binding[],
  sources: BindingSource[],
): Record<string, any> {
  const result: Record<string, any> = { ...nodeProps }
  const resolvedSources: Record<string, any> = {}

  for (const s of sources) {
    if (s.kind === 'const' || s.kind === 'json') {
      resolvedSources[s.id] = s.value
    }
  }
  for (const s of sources) {
    if (s.kind === 'expr') {
      let str = String(s.value)
      str = str.replace(/\{\{([^}]+)\}\}/g, (_, p) => {
        const v = getByPath(resolvedSources, p.trim())
        return v == null ? '' : String(v)
      })
      resolvedSources[s.id] = str
    }
  }

  for (const b of bindings) {
    const srcVal = resolvedSources[b.sourceId]
    if (srcVal === undefined) continue
    let val = srcVal
    if (b.path) {
      val = getByPath(srcVal, b.path)
    }
    result[b.prop] = val
  }
  return result
}

// Apply component prop values to the cloned node tree (legacy)
export function resolveComponentBinding(
  root: ComponentNode,
  props: ComponentProp[] | undefined,
  values: Record<string, any> = {},
): ComponentNode {
  const clone: ComponentNode = JSON.parse(JSON.stringify(root))
  if (!props) return clone
  for (const p of props) {
    if (!p.targetPath) continue
    const val = values[p.id] ?? p.defaultValue
    if (val === undefined) continue
    setByPath(clone, p.targetPath, val)
  }
  return clone
}

function getByPath(obj: any, path: string) {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  let cur = obj
  for (const k of keys) {
    if (cur == null) return undefined
    cur = cur[k]
  }
  return cur
}

function setByPath(obj: any, path: string, value: any) {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  let cur = obj
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur == null) return
    cur = cur[keys[i]]
  }
  if (cur) cur[keys[keys.length - 1]] = value
}

