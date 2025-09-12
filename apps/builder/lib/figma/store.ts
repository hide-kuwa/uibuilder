'use client'
import { create } from 'zustand'
import type { Document, Node, Page, MotionInline } from './model'

function findNode(root: Node, id: string): Node | null {
  if (root.id === id) return root
  // @ts-expect-error runtime guard
  if (root.children && Array.isArray(root.children)) {
    for (const c of root.children) {
      const r = findNode(c, id)
      if (r) return r
    }
  }
  return null
}

function cloneRect(n: Node) {
  return { id: (n as any).id, x: (n as any).x, y: (n as any).y, width: (n as any).width, height: (n as any).height }
}

const defaultDoc: Document = {
  id: 'doc-1',
  name: 'Untitled',
  pages: [
    {
      id: 'page-1',
      name: 'Page 1',
      root: {
        id: 'root',
        type: 'FRAME',
        name: 'Frame',
        x: 80, y: 80, width: 960, height: 640,
        children: [
          { id: 't1', type: 'TEXT', name: 'Heading', x: 40, y: 40, width: 320, height: 24, content: 'ダブルクリックで編集（v0）' },
        ],
      },
    },
  ],
}

type RectPatch = Partial<Pick<Node, 'x' | 'y' | 'width' | 'height'>>

type State = {
  doc: Document
  selectedIds: string[]
  editingTextId?: string | null
  ghostRect?: { id: string; x: number; y: number; width: number; height: number } | null
  transformHandle?: string | null
  transformStart?: { id: string; x: number; y: number; width: number; height: number } | null
  readonly selectedNode: Node | null
  select: (ids: string[], additive?: boolean) => void
  clearSelect: () => void
  startEditingText: (id: string) => void
  stopEditingText: () => void
  setTextContent: (id: string, value: string) => void
  setNodeRect: (id: string, patch: RectPatch) => void
  beginTransform: (id: string, handle?: string) => void
  setGhostRect: (rect: { id: string; x: number; y: number; width: number; height: number }) => void
  commitGhost: () => void
  cancelGhost: () => void
  applySnap: (rect: { id: string; x: number; y: number; width: number; height: number }) => { id: string; x: number; y: number; width: number; height: number }
  duplicateNode: (id: string) => string | null
  wrapInStack: (direction: 'H'|'V') => void
  setStackProps: (id: string, patch: Partial<{direction:'H'|'V';spacing:number;padding:{t:number;r:number;b:number;l:number};align:'START'|'CENTER'|'END'|'SPACE_BETWEEN'}>) => void
  setNodeMotion: (id: string, patch: Partial<MotionInline>) => void
  undo: () => void
  redo: () => void
}

export const useFigmaStore = create<State>((set, get) => ({
  doc: defaultDoc,
  selectedIds: [],
  editingTextId: null,
  ghostRect: null,
  transformHandle: null,
  transformStart: null,
  get selectedNode() {
    const ids = get().selectedIds
    if (!ids.length) return null
    const page: Page = get().doc.pages[0]
    return findNode(page.root, ids[0])
  },
  select: (ids, additive) => set((s) => ({ selectedIds: additive ? Array.from(new Set([...s.selectedIds, ...ids])) : ids })),
  clearSelect: () => set({ selectedIds: [] }),
  startEditingText: (id) => set({ editingTextId: id }),
  stopEditingText: () => set({ editingTextId: null }),
  setTextContent: (id, value) => set((s) => {
    const page = s.doc.pages[0]
    const node = findNode(page.root, id)
    if (node && node.type === 'TEXT') { /* @ts-expect-error mutate */ node.content = value }
    return { doc: { ...s.doc } }
  }),
  setNodeRect: (id, patch) => set((s) => {
    const page = s.doc.pages[0]
    const node = findNode(page.root, id)
    if (node) {
      if (typeof patch.x === 'number') node.x = patch.x
      if (typeof patch.y === 'number') node.y = patch.y
      if (typeof patch.width === 'number') node.width = patch.width
      if (typeof patch.height === 'number') node.height = patch.height
    }
    return { doc: { ...s.doc } }
  }),
  beginTransform: (id, handle) => set((s) => {
    const n = findNode(s.doc.pages[0].root, id)
    return { ghostRect: n ? cloneRect(n) : null, transformHandle: handle ?? null, transformStart: n ? cloneRect(n) : null }
  }),
  setGhostRect: (rect) => set({ ghostRect: rect }),
  commitGhost: () => set((s) => {
    const g = s.ghostRect
    if (!g) return {}
    const page = s.doc.pages[0]
    const node = findNode(page.root, g.id)
    if (node) {
      ;(node as any).x = g.x; (node as any).y = g.y; (node as any).width = g.width; (node as any).height = g.height
    }
    return { doc: { ...s.doc }, ghostRect: null, transformHandle: null, transformStart: null }
  }),
  cancelGhost: () => set({ ghostRect: null }),
  applySnap: (rect) => {
    const s = get()
    const root = s.doc.pages[0].root
    const handle = s.transformHandle
    const thr = 6
    const grid = 8
    const findParent = (node: Node, id: string, parent: Node | null = null): Node | null => {
      if (node.id === id) return parent
      // @ts-expect-error children guard
      if (node.children && Array.isArray(node.children)) {
        for (const c of node.children) { const p = findParent(c, id, node); if (p) return p }
      }
      return null
    }
    const parent = findParent(root, rect.id) ?? root
    // @ts-expect-error children guard
    const siblings: Node[] = (parent.children ?? []).filter((n: Node) => n.id !== rect.id)
    const pW = (parent as any).width ?? root.width
    const pH = (parent as any).height ?? root.height
    const candidatesX = new Set<number>([0, pW / 2, pW])
    const candidatesY = new Set<number>([0, pH / 2, pH])
    for (const sbl of siblings) {
      candidatesX.add((sbl as any).x); candidatesX.add((sbl as any).x + (sbl as any).width); candidatesX.add((sbl as any).x + (sbl as any).width / 2)
      candidatesY.add((sbl as any).y); candidatesY.add((sbl as any).y + (sbl as any).height); candidatesY.add((sbl as any).y + (sbl as any).height / 2)
    }
    const nearGrid = (n: number) => Math.round(n / grid) * grid
    const snap1D = (val: number, cands: Set<number>) => {
      let best = { d: Infinity, target: val }
      for (const c of cands) {
        const d = Math.abs(val - c)
        if (d < best.d && d <= thr) best = { d, target: c }
      }
      const g = nearGrid(val)
      const dg = Math.abs(val - g)
      if (dg < best.d && dg <= thr) best = { d: dg, target: g }
      return best.target
    }
    let { x, y, width: w, height: h } = rect
    const left = x, right = x + w, hc = x + w / 2
    const top = y, bottom = y + h, vc = y + h / 2
    if (!handle) {
      const tx = [snap1D(left, candidatesX) - left, snap1D(right, candidatesX) - right, snap1D(hc, candidatesX) - hc]
      const ty = [snap1D(top, candidatesY) - top, snap1D(bottom, candidatesY) - bottom, snap1D(vc, candidatesY) - vc]
      const dx = tx.sort((a,b)=>Math.abs(a)-Math.abs(b))[0] ?? 0
      const dy = ty.sort((a,b)=>Math.abs(a)-Math.abs(b))[0] ?? 0
      x += dx; y += dy
    } else {
      if (handle.includes('w')) { const nx = snap1D(left, candidatesX); const dw = (x + w) - nx; x = nx; w = Math.max(1, dw) }
      if (handle.includes('e')) { const nr = snap1D(right, candidatesX); w = Math.max(1, nr - x) }
      if (handle.includes('n')) { const ny = snap1D(top, candidatesY); const dh = (y + h) - ny; y = ny; h = Math.max(1, dh) }
      if (handle.includes('s')) { const nb = snap1D(bottom, candidatesY); h = Math.max(1, nb - y) }
    }
    return { id: rect.id, x, y, width: w, height: h }
  },
  duplicateNode: (id) => {
    const s = get()
    const root = s.doc.pages[0].root
    const findParent = (node: Node, target: string, parent: Node | null = null): Node | null => {
      if (node.id === target) return parent
      // @ts-expect-error children guard
      if (node.children && Array.isArray(node.children)) {
        for (const c of node.children) { const p = findParent(c, target, node); if (p) return p }
      }
      return null
    }
    const original = findNode(root, id)
    if (!original) return null
    const parent = findParent(root, id) ?? root
    const newid = () => 'n_' + Math.random().toString(36).slice(2) + Date.now().toString(36)
    const cloneNode = (n: any): any => {
      const c: any = { ...n, id: newid() }
      if (Array.isArray(n.children)) c.children = n.children.map(cloneNode)
      return c
    }
    const dup = cloneNode(original)
    dup.x = (original as any).x + 16; dup.y = (original as any).y + 16
    // @ts-expect-error children guard
    if (!Array.isArray((parent as any).children)) (parent as any).children = []
    ;(parent as any).children.push(dup)
    set({ doc: { ...s.doc } })
    return dup.id as string
  },

  wrapInStack: (direction) => {
    const s = get()
    const ids = s.selectedIds
    if (!ids.length) return
    const root = s.doc.pages[0].root
    // find common parent
    const findParent = (node: Node, target: string, parent: Node | null = null): Node | null => {
      if (node.id === target) return parent
      // @ts-expect-error
      if (node.children && Array.isArray(node.children)) {
        for (const c of node.children) { const p = findParent(c, target, node); if (p) return p }
      }
      return null
    }
    const parents = ids.map(id => findParent(root, id) ?? root)
    const firstParent = parents[0]
    if (!parents.every(p => p?.id === firstParent?.id)) return // 異なる親はv0では不可
    // @ts-expect-error
    const siblings: Node[] = (firstParent.children ?? []) as any
    const selNodes: Node[] = siblings.filter(n => ids.includes(n.id))
    if (!selNodes.length) return
    // bounds
    const minX = Math.min(...selNodes.map(n => (n as any).x))
    const minY = Math.min(...selNodes.map(n => (n as any).y))
    const maxR = Math.max(...selNodes.map(n => (n as any).x + (n as any).width))
    const maxB = Math.max(...selNodes.map(n => (n as any).y + (n as any).height))
    const stack: any = {
      id: 'stack_' + Math.random().toString(36).slice(2),
      type: 'STACK',
      name: 'Stack',
      x: minX, y: minY, width: maxR - minX, height: maxB - minY,
      direction, spacing: 16,
      padding: { t: 0, r: 0, b: 0, l: 0 },
      align: 'START',
      children: [] as Node[],
    }
    // remove selected from parent & insert stack at index of first selected
    const firstIndex = siblings.findIndex(n => n.id === selNodes[0].id)
    // @ts-expect-error
    firstParent.children = siblings.filter(n => !ids.includes(n.id))
    // normalize child positions to stack origin
    const normalized = selNodes.map((n:any) => ({ ...n, x: n.x - minX, y: n.y - minY }))
    stack.children = normalized
    // @ts-expect-error
    firstParent.children.splice(firstIndex, 0, stack)
    set({ doc: { ...s.doc }, selectedIds: [stack.id] })
  },

  setStackProps: (id, patch) => set((s) => {
    const page = s.doc.pages[0]
    const node = findNode(page.root, id) as any
    if (node && node.type === 'STACK') {
      if (patch.direction) node.direction = patch.direction
      if (typeof patch.spacing === 'number') node.spacing = patch.spacing
      if (patch.padding) node.padding = { ...(node.padding ?? { t:0,r:0,b:0,l:0 }), ...patch.padding }
      if (patch.align) node.align = patch.align
    }
    return { doc: { ...s.doc } }
  }),
  setNodeMotion: (id, patch) => set((s) => {
    const page = s.doc.pages[0]
    const node = findNode(page.root, id)
    if (node) {
      const base: any = (node as any).motion ?? {}
      const merged = {
        ...base,
        ...patch,
        options: { ...(base.options ?? {}), ...(patch as any)?.options ?? {} },
      }
      ;(node as any).motion = merged
    }
    return { doc: { ...s.doc } }
  }),
  undo: () => { /* stub */ },
  redo: () => { /* stub */ },
}))
