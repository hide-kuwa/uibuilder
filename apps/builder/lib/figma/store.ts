import { create } from 'zustand'
import type { Document, Node, MotionInline, RectPatch } from './model'
import { findNode } from './model'

// simple initial document
const emptyDoc: Document = {
  pages: [
    {
      id: 'page-1',
      name: 'Page 1',
      root: { id: 'root', type: 'FRAME', x: 0, y: 0, width: 0, height: 0 },
    },
  ],
}

type State = {
  doc: Document
  selectedIds: string[]
  editingTextId?: string | null
  ghostRect?: { id: string; x: number; y: number; width: number; height: number } | null
  // derived
  selectedNode: Node | null
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
  doc: emptyDoc,
  selectedIds: [],
  editingTextId: null,
  ghostRect: null,
  selectedNode: null,
  select: (ids, additive) =>
    set((state) => {
      const newIds = additive ? Array.from(new Set([...state.selectedIds, ...ids])) : ids
      const page = state.doc.pages[0]
      return {
        selectedIds: newIds,
        selectedNode: newIds[0] ? findNode(page.root, newIds[0]) : null,
      }
    }),
  clearSelect: () => set({ selectedIds: [], selectedNode: null }),
  startEditingText: (id) => set({ editingTextId: id }),
  stopEditingText: () => set({ editingTextId: null }),
  setTextContent: (id, value) =>
    set((s) => {
      const page = s.doc.pages[0]
      const node = findNode(page.root, id)
      if (node) (node as any).text = value
      return { doc: { ...s.doc } }
    }),
  setNodeRect: (id, patch) =>
    set((s) => {
      const page = s.doc.pages[0]
      const node = findNode(page.root, id)
      if (node) Object.assign(node, patch)
      return { doc: { ...s.doc } }
    }),
  beginTransform: (_id) => {},
  setGhostRect: (rect) => set({ ghostRect: rect }),
  commitGhost: () =>
    set((s) => {
      const ghost = s.ghostRect
      if (!ghost) return {}
      const page = s.doc.pages[0]
      const node = findNode(page.root, ghost.id)
      if (node) Object.assign(node, ghost)
      return { ghostRect: null, doc: { ...s.doc } }
    }),
  cancelGhost: () => set({ ghostRect: null }),
  setNodeMotion: (id, patch) =>
    set((s) => {
      const page = s.doc.pages[0]
      const node = findNode(page.root, id)
      if (node) {
        // shallow merge for motion + options (v0)
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
  undo: () => {},
  redo: () => {},
}))
