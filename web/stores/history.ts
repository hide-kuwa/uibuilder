'use client'
import { create } from 'zustand'
import { useCanvasStore, type XY } from '@/stores/canvas'

type Snapshot = {
  nodePos: Record<string, XY>
  nodeSize?: Record<string, { w: number; h: number }>
  tx: number
  ty: number
  scale: number
}

type HistoryState = {
  past: Snapshot[]
  future: Snapshot[]
  canUndo: boolean
  canRedo: boolean
  record: () => void
  undo: () => void
  redo: () => void
  clear: () => void
}

function takeSnapshot(): Snapshot {
  const s = useCanvasStore.getState()
  // できるだけ浅いコピーで十分（構造はプリミティブ）
  return {
    nodePos: { ...s.nodePos },
    // nodeSize を使っていなければコメントアウトでOK
    // @ts-ignore
    nodeSize: s.nodeSize ? { ...s.nodeSize } : undefined,
    tx: s.tx,
    ty: s.ty,
    scale: s.scale,
  }
}

function applySnapshot(ss: Snapshot) {
  // CanvasStore に反映
  const st = useCanvasStore.getState()
  useCanvasStore.setState({
    nodePos: ss.nodePos,
    // @ts-ignore
    nodeSize: ss.nodeSize ?? st.nodeSize,
    tx: ss.tx,
    ty: ss.ty,
    scale: ss.scale,
  })
}

export const useHistoryStore = create<HistoryState>()((set, get) => ({
  past: [],
  future: [],
  canUndo: false,
  canRedo: false,

  record: () => {
    const snap = takeSnapshot()
    const nextPast = [...get().past, snap]
    set({ past: nextPast, future: [], canUndo: nextPast.length > 0, canRedo: false })
  },

  undo: () => {
    const past = get().past
    if (!past.length) return
    const current = takeSnapshot()
    const prev = past[past.length - 1]
    applySnapshot(prev)
    set({
      past: past.slice(0, -1),
      future: [current, ...get().future],
      canUndo: past.length - 1 > 0,
      canRedo: true,
    })
  },

  redo: () => {
    const future = get().future
    if (!future.length) return
    const current = takeSnapshot()
    const next = future[0]
    applySnapshot(next)
    set({
      past: [...get().past, current],
      future: future.slice(1),
      canUndo: true,
      canRedo: future.length - 1 > 0,
    })
  },

  clear: () => set({ past: [], future: [], canUndo: false, canRedo: false }),
}))

