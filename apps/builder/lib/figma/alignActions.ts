import { useFigmaStore } from './store'
import type { Node } from './model'

function findNode(root: Node, id: string): Node | null {
  if (root.id === id) return root
  const anyRoot: any = root
  if (anyRoot.children && Array.isArray(anyRoot.children)) {
    for (const c of anyRoot.children as any[]) {
      const r = findNode(c, id)
      if (r) return r
    }
  }
  return null
}

export type AlignMode = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
export type DistributeMode = 'horizontal' | 'vertical'

export function alignSelected(mode: AlignMode) {
  const s = useFigmaStore.getState()
  const ids = s.selectedIds
  if (ids.length < 2) return
  const page = s.doc.pages[0]
  const nodes = ids
    .map((id) => findNode(page.root, id))
    .filter(Boolean) as Node[]
  if (nodes.length < 2) return
  const xs = nodes.map((n) => n.x)
  const ys = nodes.map((n) => n.y)
  const rs = nodes.map((n) => n.x + n.width)
  const bs = nodes.map((n) => n.y + n.height)
  const minX = Math.min(...xs)
  const minY = Math.min(...ys)
  const maxR = Math.max(...rs)
  const maxB = Math.max(...bs)
  const cx = (minX + maxR) / 2
  const cy = (minY + maxB) / 2
  for (const n of nodes) {
    const patch: { x?: number; y?: number } = {}
    if (mode === 'left') patch.x = minX
    if (mode === 'center') patch.x = cx - n.width / 2
    if (mode === 'right') patch.x = maxR - n.width
    if (mode === 'top') patch.y = minY
    if (mode === 'middle') patch.y = cy - n.height / 2
    if (mode === 'bottom') patch.y = maxB - n.height
    s.updateNode(n.id, patch)
  }
}

export function distributeSelected(mode: DistributeMode) {
  const s = useFigmaStore.getState()
  const ids = s.selectedIds
  if (ids.length < 3) return
  const page = s.doc.pages[0]
  const nodes = ids
    .map((id) => findNode(page.root, id))
    .filter(Boolean) as Node[]
  if (nodes.length < 3) return
  if (mode === 'horizontal') {
    const arr = nodes.slice().sort((a, b) => a.x - b.x)
    const minX = Math.min(...arr.map((n) => n.x))
    const maxR = Math.max(...arr.map((n) => n.x + n.width))
    const totalW = arr.reduce((t, n) => t + n.width, 0)
    const gap = (maxR - minX - totalW) / (arr.length - 1)
    let cursor = minX
    for (let i = 0; i < arr.length; i++) {
      const n = arr[i]
      const x = i === 0 ? n.x : cursor
      s.updateNode(n.id, { x })
      cursor = x + n.width + gap
    }
  } else {
    const arr = nodes.slice().sort((a, b) => a.y - b.y)
    const minY = Math.min(...arr.map((n) => n.y))
    const maxB = Math.max(...arr.map((n) => n.y + n.height))
    const totalH = arr.reduce((t, n) => t + n.height, 0)
    const gap = (maxB - minY - totalH) / (arr.length - 1)
    let cursor = minY
    for (let i = 0; i < arr.length; i++) {
      const n = arr[i]
      const y = i === 0 ? n.y : cursor
      s.updateNode(n.id, { y })
      cursor = y + n.height + gap
    }
  }
}

