'use client'
import { create } from 'zustand'

type GridState = {
  size: number
  visible: boolean
  snap: boolean
  showGrid: boolean
  snapGrid: boolean
  pitch: number
  subDiv: number
  offsetX: number
  offsetY: number
  minGapPx: number
  setSize: (n: number) => void
  setVisible: (v: boolean) => void
  setSnap: (v: boolean) => void
  setShowGrid: (v: boolean) => void
  setSnapGrid: (v: boolean) => void
  setPitch: (n: number) => void
  setSubDiv: (n: number) => void
  setOffset: (x: number, y: number) => void
  setMinGapPx: (n: number) => void
}

export const useGridStore = create<GridState>((set) => ({
  size: 8,
  visible: true,
  snap: true,
  showGrid: true,
  snapGrid: true,
  pitch: 8,
  subDiv: 4,
  offsetX: 0,
  offsetY: 0,
  minGapPx: 8,
  setSize: (n) => set({ size: n, pitch: n }),
  setVisible: (v) => set({ visible: v, showGrid: v }),
  setSnap: (v) => set({ snap: v, snapGrid: v }),
  setShowGrid: (v) => set({ visible: v, showGrid: v }),
  setSnapGrid: (v) => set({ snap: v, snapGrid: v }),
  setPitch: (n) => set({ size: Math.max(1, Math.round(n)), pitch: Math.max(1, Math.round(n)) }),
  setSubDiv: (n) => set({ subDiv: Math.max(1, Math.round(n)) }),
  setOffset: (x, y) => set({ offsetX: x, offsetY: y }),
  setMinGapPx: (n) => set({ minGapPx: Math.max(2, Math.round(n)) }),
}))
