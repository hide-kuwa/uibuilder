import { create } from 'zustand'

export type Point = { x: number; y: number }
export type Size = { width: number; height: number }
export type BBox = { x: number; y: number; w: number; h: number }

const ZOOM_MIN = 0.25
const ZOOM_MAX = 4

interface ViewState {
  zoom: number
  pan: Point
}

interface ViewActions {
  setZoom: (z: number) => void
  setPan: (p: Point) => void
  fitToBounds: (canvas: Size, bbox: BBox) => void
  worldToScreen: (p: Point) => Point
  screenToWorld: (p: Point) => Point
}

export const useViewStore = create<ViewState & ViewActions>((set, get) => ({
  zoom: 1,
  pan: { x: 0, y: 0 },
  setZoom(z) {
    const clamped = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, z))
    set({ zoom: clamped })
  },
  setPan(p) {
    set({ pan: p })
  },
  fitToBounds(canvas, bbox) {
    if (bbox.w === 0 || bbox.h === 0) {
      set({ zoom: 1, pan: { x: 0, y: 0 } })
      return
    }
    const zx = canvas.width / bbox.w
    const zy = canvas.height / bbox.h
    const z = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.min(zx, zy)))
    const x = (canvas.width - bbox.w * z) / 2 - bbox.x * z
    const y = (canvas.height - bbox.h * z) / 2 - bbox.y * z
    set({ zoom: z, pan: { x, y } })
  },
  worldToScreen(p) {
    const { zoom, pan } = get()
    return { x: p.x * zoom + pan.x, y: p.y * zoom + pan.y }
  },
  screenToWorld(p) {
    const { zoom, pan } = get()
    return { x: (p.x - pan.x) / zoom, y: (p.y - pan.y) / zoom }
  },
}))

export { ZOOM_MIN, ZOOM_MAX }

