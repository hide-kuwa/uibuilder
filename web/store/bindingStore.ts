import { create } from 'zustand'
import { nanoid } from 'nanoid'

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

interface BindingState {
  sources: BindingSource[]
  bindings: Binding[]
}

interface BindingActions {
  addSource: (kind: BindingSource['kind'], value: any) => string
  updateSource: (
    id: string,
    patch: Partial<Omit<BindingSource, 'id'>>,
  ) => void
  removeSource: (id: string) => void
  addBinding: (b: Binding) => void
  removeBinding: (nodeId: string, prop: string) => void
}

export const useBindingStore = create<BindingState & BindingActions>((set) => ({
  sources: [],
  bindings: [],

  addSource(kind, value) {
    const id = nanoid()
    set((s) => ({ sources: [...s.sources, { id, kind, value }] }))
    return id
  },

  updateSource(id, patch) {
    set((s) => ({
      sources: s.sources.map((src) =>
        src.id === id ? { ...src, ...patch } : src,
      ),
    }))
  },

  removeSource(id) {
    set((s) => ({
      sources: s.sources.filter((src) => src.id !== id),
      bindings: s.bindings.filter((b) => b.sourceId !== id),
    }))
  },

  addBinding(b) {
    set((s) => ({ bindings: [...s.bindings, b] }))
  },

  removeBinding(nodeId, prop) {
    set((s) => ({
      bindings: s.bindings.filter(
        (b) => b.nodeId !== nodeId || b.prop !== prop,
      ),
    }))
  },
}))

