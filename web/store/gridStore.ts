import { create } from 'zustand'

type GridState = {
  showGrid: boolean
  snapGrid: boolean
  pitch: number        // 主要グリッド間隔（ワールドpx）
  subDiv: number       // マイナー何分割か（例: 4 なら 1/4 ピッチ）
  offsetX: number      // グリッド原点のX（ワールドpx）
  offsetY: number      // グリッド原点のY（ワールドpx）
  minGapPx: number     // 画面pxでの最小格子間隔（描画が詰みすぎないため）
  setShowGrid: (v: boolean) => void
  setSnapGrid: (v: boolean) => void
  setPitch: (n: number) => void
  setSubDiv: (n: number) => void
  setOffset: (x: number, y: number) => void
  setMinGapPx: (n: number) => void
}

export const useGridStore = create<GridState>((set) => ({
  showGrid: true,
  snapGrid: false,
  pitch: 16,
  subDiv: 4,
  offsetX: 0,
  offsetY: 0,
  minGapPx: 8,
  setShowGrid: (v) => set({ showGrid: v }),
  setSnapGrid: (v) => set({ snapGrid: v }),
  setPitch: (n) => set({ pitch: Math.max(1, Math.round(n)) }),
  setSubDiv: (n) => set({ subDiv: Math.max(1, Math.round(n)) }),
  setOffset: (x, y) => set({ offsetX: x, offsetY: y }),
  setMinGapPx: (n) => set({ minGapPx: Math.max(2, Math.round(n)) }),
}))

