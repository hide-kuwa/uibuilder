import { ComponentNode } from '@/components/store'

export interface LayerFilter {
  query?: string
  type?: string
  locked?: boolean
  hidden?: boolean
}

export interface FlattenedLayer {
  node: ComponentNode
  path: number[]
  depth: number
}

const matches = (node: ComponentNode, f: LayerFilter) => {
  if (f.type && node.type !== f.type) return false
  if (f.query && !(node.name || '').toLowerCase().includes(f.query.toLowerCase())) return false
  if (f.locked !== undefined && !!node.locked !== f.locked) return false
  if (f.hidden !== undefined && !!node.hidden !== f.hidden) return false
  return true
}

export const filterLayers = (
  nodes: ComponentNode[],
  f: LayerFilter,
  path: number[] = [],
  depth = 0
): FlattenedLayer[] => {
  let res: FlattenedLayer[] = []
  nodes.forEach((n, i) => {
    const p = [...path, i]
    if (matches(n, f)) {
      res.push({ node: n, path: p, depth })
    }
    if (n.children && n.children.length) {
      res = res.concat(filterLayers(n.children, f, p, depth + 1))
    }
  })
  return res
}

