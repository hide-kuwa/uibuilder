'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type XY = { x: number; y: number }

type CanvasState = {
  scale: number
  tx: number
  ty: number
  nodePos: Record<string, XY>
  setTransform: (p: Partial<Pick<CanvasState, 'scale' | 'tx' | 'ty'>>) => void
  setNodePos: (id: string, xy: XY) => void
  resetView: () => void
}

export const useCanvasStore = create<CanvasState>()(
  persist(
    (set, get) => ({
      scale: 1,
      tx: 0,
      ty: 0,
      nodePos: {},
      setTransform: (p) => set({ ...get(), ...p }),
      setNodePos: (id, xy) => set({ nodePos: { ...get().nodePos, [id]: xy } }),
      resetView: () => set({ scale: 1, tx: 0, ty: 0 }),
    }),
    { name: 'geokore-canvas-v1' }
  )
)
