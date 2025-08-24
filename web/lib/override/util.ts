import type { ComponentNode } from '@/types/editor'

export function listOverridable(root: ComponentNode): { id: string; type: string; name?: string }[] {
  const out: { id: string; type: string; name?: string }[] = []
  const walk = (n: ComponentNode) => {
    if (['Text', 'Image', 'Path', 'Frame'].includes(n.type)) {
      out.push({ id: n.id, type: n.type, name: n.name })
    }
    ;(n.children || []).forEach((c) => walk(c))
  }
  walk(root)
  return out
}
