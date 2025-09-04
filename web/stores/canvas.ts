'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { builderStore } from '@/stores/builder'

export type XY = { x: number; y: number }
export type Size = { w: number; h: number }

type CanvasState = {
  scale: number
  tx: number
  ty: number
  nodePos: Record<string, XY>
  nodeSize: Record<string, Size>
  initialPos: Record<string, XY>

  // 選択
  selectedIds: string[]
  setSelectedIds: (ids: string[]) => void
  toggleSelect: (id: string, multi?: boolean) => void
  clearSelection: () => void

  // スナップ
  snapEnabled: boolean
  gridSize: number
  snapThreshold: number

  // ガイド線（ワールド座標）
  guidesV: number[]   // 縦線 x 座標
  guidesH: number[]   // 横線 y 座標
  setGuides: (vxs: number[], hys: number[]) => void
  clearGuides: () => void

  setTransform: (p: Partial<Pick<CanvasState, 'scale' | 'tx' | 'ty'>>) => void
  setNodePos: (id: string, xy: XY) => void
  moveNodes: (ids: string[], dx: number, dy: number) => void
  clearInitialPos: () => void
  setNodeSize: (id: string, sz: Size) => void
  resetView: () => void
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      scale: 1, tx: 0, ty: 0,
      nodePos: {},
      nodeSize: {},
      initialPos: {},

      selectedIds: [],
      setSelectedIds: (ids) => set({ selectedIds: ids }),
      toggleSelect: (id, multi) => {
        const cur = get().selectedIds
        const has = cur.includes(id)
        set({ selectedIds: multi ? (has ? cur.filter(x=>x!==id) : [...cur,id]) : (has ? [] : [id]) })
      },
      clearSelection: () => set({ selectedIds: [] }),

      snapEnabled: true,
      gridSize: 20,
      snapThreshold: 6,

      guidesV: [],
      guidesH: [],
      setGuides: (vxs, hys) => set({ guidesV: vxs, guidesH: hys }),
      clearGuides: () => set({ guidesV: [], guidesH: [] }),

      setTransform: (p) => set({ ...get(), ...p }),
      setNodePos: (id, xy) => set({ nodePos: { ...get().nodePos, [id]: xy } }),
      moveNodes: (ids, dx, dy) => {
        const next = { ...get().nodePos }
        const base = { ...get().initialPos }
        const b = builderStore.getState() as any
        for (const id of ids) {
          if (!base[id]) {
            const p = next[id]
              ?? b.nodes?.[id]?.position
              ?? (() => {
                const el = b.elements?.find((e: any) => e.id === id)
                return el ? { x: el.x, y: el.y } : { x: 0, y: 0 }
              })()
            base[id] = p
          }
          next[id] = { x: base[id].x + dx, y: base[id].y + dy }
        }
        set({ nodePos: next, initialPos: base })
      },
      clearInitialPos: () => set({ initialPos: {} }),
      setNodeSize: (id, sz) => set({ nodeSize: { ...get().nodeSize, [id]: sz } }),
      resetView: () => set({ scale: 1, tx: 0, ty: 0 }),
    }),
    { name: 'geokore-canvas-v3' }
  )
)
