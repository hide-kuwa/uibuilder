'use client'
import { create } from 'zustand'
import { useBuilderStore } from '@/store/builderStore'
import { useDesignTokens } from '@/store/designTokensStore'

export type Snapshot = {
  elements: any[]
  meta?: any
  designTokens?: any
}

type State = {
  past: Snapshot[]
  present: Snapshot | null
  future: Snapshot[]
  capacity: number
  busy: boolean
}
type Actions = {
  initFromCurrent: () => void
  push: (snap: Snapshot) => void
  undo: () => void
  redo: () => void
  clear: () => void
  setCapacity: (n: number) => void
  apply: (snap: Snapshot) => void
  getCounts: () => { past: number; future: number }
  getPresent: () => Snapshot | null
}

export const useHistoryStore = create<State & Actions>((set, get) => ({
  past: [],
  present: null,
  future: [],
  capacity: 50,
  busy: false,
  initFromCurrent: () => {
    const s = snapshotFromStores()
    set({ past: [], present: s, future: [] })
  },
  push: (snap) => {
    const { present, past, capacity } = get()
    if (!present) { set({ present: snap }); return }
    const np = [...past, present]
    const trimmed = np.length > capacity ? np.slice(np.length - capacity) : np
    set({ past: trimmed, present: snap, future: [] })
  },
  undo: () => {
    const { past, present, future } = get()
    if (past.length === 0 || !present) return
    const prev = past[past.length - 1]
    const rest = past.slice(0, -1)
    set({ past: rest, present: prev, future: [present, ...future], busy: true })
    applyToStores(prev)
    set({ busy: false })
  },
  redo: () => {
    const { future, present, past } = get()
    if (future.length === 0 || !present) return
    const next = future[0]
    const rest = future.slice(1)
    set({ past: [...past, present], present: next, future: rest, busy: true })
    applyToStores(next)
    set({ busy: false })
  },
  clear: () => set({ past: [], present: get().present, future: [] }),
  setCapacity: (n) => set({ capacity: Math.max(1, Math.min(500, n)) }),
  apply: (snap) => {
    set({ busy: true })
    applyToStores(snap)
    set({ busy: false })
  },
  getCounts: () => ({ past: get().past.length, future: get().future.length }),
  getPresent: () => get().present,
}))

function snapshotFromStores(): Snapshot {
  const s = useBuilderStore.getState()
  const meta = (s as any).meta || { id: 'local', name: 'Local Project' }
  const tokens = useDesignTokens.getState().getAll?.() ?? useDesignTokens.getState().tokens
  return { elements: s.elements, meta, designTokens: tokens }
}

function applyToStores(snap: Snapshot) {
  useBuilderStore.setState({ elements: snap.elements, meta: snap.meta || {} })
  if (snap.designTokens) {
    useDesignTokens.getState().replaceAll?.(snap.designTokens)
  }
}

export function makeSnapshot(): Snapshot {
  return {
    elements: useBuilderStore.getState().elements,
    meta: (useBuilderStore.getState() as any).meta || { id: 'local', name: 'Local Project' },
    designTokens: useDesignTokens.getState().getAll?.() ?? useDesignTokens.getState().tokens
  }
}

