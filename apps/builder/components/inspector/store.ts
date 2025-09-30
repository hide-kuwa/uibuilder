'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { get as idbGet, set as idbSet, del as idbDel } from 'idb-keyval'
import type { Document, Node, Page, NodeStyle, NodeMotion, Shadow } from './model'

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
        x: 80,
        y: 80,
        width: 960,
        height: 640,
        children: [
          {
            id: 't1',
            type: 'TEXT',
            name: 'Heading',
            x: 40,
            y: 40,
            width: 320,
            height: 24,
            content: 'ダブルクリックで編集（v0）',
          },
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
  // derived
  readonly selectedNode: Node | null
  // actions
  select: (ids: string[], additive?: boolean) => void
  clearSelect: () => void
  startEditingText: (id: string) => void
  stopEditingText: () => void
  setTextContent: (id: string, value: string) => void
  updateNode: (id: string, patch: RectPatch) => void
  updateNodeStyle: (id: string, patch: Partial<NodeStyle>) => void
  pushShadow: (id: string, shadow?: Shadow) => void
  removeShadowAt: (id: string, idx: number) => void
  moveShadow: (id: string, from: number, to: number) => void
  beginTransform: (id: string) => void
  setGhostRect: (rect: { id: string; x: number; y: number; width: number; height: number }) => void
  commitGhost: () => void
  cancelGhost: () => void
  setNodeMotion: (id: string, patch: Partial<NodeMotion>) => void
  undo: () => void
  redo: () => void
}

function mergeDeep<T extends Record<string, any>>(base: T, patch: Partial<T>): T {
  const out: any = { ...base }
  for (const k in patch) {
    const v: any = (patch as any)[k]
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      out[k] = mergeDeep(out[k] ?? {}, v)
    } else if (v !== undefined) {
      out[k] = v
    }
  }
  return out
}

const idbStorage = (() => {
  try {
    if (typeof indexedDB !== 'undefined') {
      return {
        getItem: (name: string) => idbGet(name),
        setItem: (name: string, value: string) => idbSet(name, value),
        removeItem: (name: string) => idbDel(name),
      }
    }
  } catch {
    /* noop */
  }
  return {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  }
})()

export const useFigmaStore = create<State>()(
  persist(
    (set, get) => ({
      doc: defaultDoc,
      selectedIds: [],
      editingTextId: null,
      ghostRect: null,
      get selectedNode() {
        const ids = get().selectedIds
        if (!ids.length) return null
        const page: Page = get().doc.pages[0]
        return findNode(page.root, ids[0])
      },
      select: (ids, additive) =>
        set((s) => ({
          selectedIds: additive ? Array.from(new Set([...s.selectedIds, ...ids])) : ids,
        })),
      clearSelect: () => set({ selectedIds: [] }),
      startEditingText: (id) => set({ editingTextId: id }),
      stopEditingText: () => set({ editingTextId: null }),
      setTextContent: (id, value) =>
        set((s) => {
          const page = s.doc.pages[0]
          const node = findNode(page.root, id)
          if (node && node.type === 'TEXT') {
            // @ts-expect-error mutate
            node.content = value
          }
          return { doc: { ...s.doc } }
        }),
      updateNode: (id, patch) =>
        set((s) => {
          const page = s.doc.pages[0]
          const node = findNode(page.root, id)
          if (node) {
            if (typeof patch.x === 'number') node.x = patch.x
            if (typeof patch.y === 'number') node.y = patch.y
            if (typeof patch.width === 'number') node.width = Math.max(1, patch.width)
            if (typeof patch.height === 'number') node.height = Math.max(1, patch.height)
          }
          return { doc: { ...s.doc } }
        }),
      updateNodeStyle: (id, patch) =>
        set((s) => {
          const page = s.doc.pages[0]
          const node: any = findNode(page.root, id)
          if (node) {
            const base = node.style ?? {}
            node.style = mergeDeep(base, patch)
          }
          return { doc: { ...s.doc } }
        }),
      pushShadow: (id, shadow) =>
        set((s) => {
          const page = s.doc.pages[0]
          const node: any = findNode(page.root, id)
          if (node) {
            const style = node.style ?? (node.style = {})
            const arr: Shadow[] = style.shadows ?? (style.shadows = [])
            arr.push(
              shadow ?? {
                x: 0,
                y: 4,
                blur: 12,
                spread: 0,
                color: 'rgba(0,0,0,0.1)',
              }
            )
          }
          return { doc: { ...s.doc } }
        }),
      removeShadowAt: (id, idx) =>
        set((s) => {
          const page = s.doc.pages[0]
          const node: any = findNode(page.root, id)
          if (node?.style?.shadows) {
            node.style.shadows = node.style.shadows.filter((_: any, i: number) => i !== idx)
          }
          return { doc: { ...s.doc } }
        }),
      moveShadow: (id, from, to) =>
        set((s) => {
          const page = s.doc.pages[0]
          const node: any = findNode(page.root, id)
          if (node?.style?.shadows) {
            const arr = node.style.shadows
            const len = arr.length
            if (from >= 0 && from < len && to >= 0 && to < len && from !== to) {
              const [sp] = arr.splice(from, 1)
              arr.splice(to, 0, sp)
            }
          }
          return { doc: { ...s.doc } }
        }),
      beginTransform: (_id) => {
        /* stub for v0 */
      },
      setGhostRect: (rect) => set({ ghostRect: rect }),
      commitGhost: () =>
        set((s) => {
          const g = s.ghostRect
          if (!g) return {}
          const page = s.doc.pages[0]
          const node = findNode(page.root, g.id)
          if (node) {
            node.x = g.x
            node.y = g.y
            node.width = g.width
            node.height = g.height
          }
          return { doc: { ...s.doc }, ghostRect: null }
        }),
      cancelGhost: () => set({ ghostRect: null }),
      setNodeMotion: (id, patch) =>
        set((s) => {
          const page = s.doc.pages[0]
          const node: any = findNode(page.root, id)
          if (node) {
            const base = node.motion ?? {}
            node.motion = { ...base, ...patch }
          }
          return { doc: { ...s.doc } }
        }),
      undo: () => {
        /* stub */
      },
      redo: () => {
        /* stub */
      },
    }),
    {
      name: 'uibuilder-figma-doc-v1',
      storage: createJSONStorage(() => idbStorage),
      partialize: (s) => ({ doc: s.doc, selectedIds: s.selectedIds }),
    }
  )
)

export type FigmaDevNode = {
  id: string
  type: 'TEXT' | 'RECT'
  x: number
  y: number
  w: number
  h: number
  text?: string
}

type FigmaDevState = {
  nodes: FigmaDevNode[]
  selectedId: string | null
  addNode: (node: FigmaDevNode) => void
  updateNode: (id: string, patch: Partial<FigmaDevNode>) => void
  selectNode: (id: string | null) => void
}

export const useFigmaDevStore = create<FigmaDevState>((set) => ({
  nodes: [],
  selectedId: null,
  addNode: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
  updateNode: (id, patch) =>
    set((s) => ({
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
    })),
  selectNode: (id) => set({ selectedId: id }),
}))
