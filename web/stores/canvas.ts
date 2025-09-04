'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type XY = { x: number; y: number }

type CanvasState = {
  scale: number
  tx: number
  ty: number
  nodePos: Record<string, XY>
  initialPos: Record<string, XY>

  // 選択
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
  toggleSelect: (id: string, multi?: boolean) => void
  clearSelection: () => void

  // スナップ設定
  snapEnabled: boolean
  gridSize: number
  snapThreshold: number

  setTransform: (p: Partial<Pick<CanvasState, 'scale' | 'tx' | 'ty'>>) => void
  setNodePos: (id: string, xy: XY) => void
  setInitialPos: (id: string, xy: XY, overwrite?: boolean) => void
  moveNodes: (ids: string[], dx: number, dy: number) => void
  resetView: () => void
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      scale: 1,
      tx: 0,
      ty: 0,
      nodePos: {},
      initialPos: {},

      selectedIds: [],
      setSelectedIds: (ids) => set({ selectedIds: ids }),
      toggleSelect: (id, multi) => {
        const cur = get().selectedIds
        const has = cur.includes(id)
        if (multi) {
          set({ selectedIds: has ? cur.filter(x => x !== id) : [...cur, id] })
        } else {
          set({ selectedIds: has ? [] : [id] })
        }
      },
      clearSelection: () => set({ selectedIds: [] }),

      snapEnabled: true,
      gridSize: 20,
      snapThreshold: 6,

      setTransform: (p) => set({ ...get(), ...p }),
      setNodePos: (id, xy) => set({ nodePos: { ...get().nodePos, [id]: xy } }),

      setInitialPos: (id, xy, overwrite = false) => {
        const cur = get().initialPos
        if (!overwrite && cur[id]) return
        set({ initialPos: { ...cur, [id]: xy } })
      },

      moveNodes: (ids, dx, dy) => {
        const next = { ...get().nodePos }
        const base = get().initialPos
        for (const id of ids) {
          const cur = next[id] ?? base[id] ?? { x: 0, y: 0 }
          next[id] = { x: cur.x + dx, y: cur.y + dy }
        }
        set({ nodePos: next })
      },

      resetView: () => set({ scale: 1, tx: 0, ty: 0 }),
    }),
    { name: 'geokore-canvas-v4' } // バージョンキー更新
  )
)
