import type { ComponentNode } from '@/types/editor'

export function findNode(nodes: ComponentNode[] | ComponentNode | undefined, id: string): ComponentNode | null {
  if (!nodes) return null
  if (Array.isArray(nodes)) {
    for (const n of nodes) {
      const r = findNode(n, id)
      if (r) return r
    }
    return null
  }
  if (nodes.id === id) return nodes
  if (nodes.children) {
    for (const c of nodes.children) {
      const r = findNode(c, id)
      if (r) return r
    }
  }
  return null
}

export function deepCloneNodeTree<T extends ComponentNode>(node: T): T {
  return JSON.parse(JSON.stringify(node)) as T
}
