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
  setNodeRect: (id: string, patch: RectPatch) => void
  beginTransform: (id: string) => void
  setGhostRect: (rect: { id: string; x: number; y: number; width: number; height: number }) => void
  commitGhost: () => void
  cancelGhost: () => void
  setNodeMotion: (id: string, patch: Partial<MotionInline>) => void
  undo: () => void
  redo: () => void
}

export const useFigmaStore = create<State>((set, get) => ({
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
  setNodeRect: (id, patch) =>
    set((s) => {
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
      const node = findNode(page.root, id)
      if (node) {
        const base: any = (node as any).motion ?? {}
        const merged = {
          ...base,
          ...patch,
          options: { ...(base.options ?? {}), ...(patch.options ?? {}) },
        }
        ;(node as any).motion = merged
      }
      return { doc: { ...s.doc } }
    }),
  undo: () => {
    /* stub */
  },
  redo: () => {
    /* stub */
  },
}))
