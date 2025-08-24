import type { ComponentNode, ComponentProp } from '@/types/editor'

// Apply component prop values to the cloned node tree
export function resolveBinding(
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

function setByPath(obj: any, path: string, value: any) {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.')
  let cur = obj
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur == null) return
    cur = cur[keys[i]]
  }
  if (cur) cur[keys[keys.length - 1]] = value
}

