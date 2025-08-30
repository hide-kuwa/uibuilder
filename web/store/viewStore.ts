import { create } from 'zustand'

type Pt = { x:number, y:number }
type ViewState = {
  zoom: number      // 1.0 default
  pan: Pt           // in screen pixels, applied as CSS translate
  minZoom: number
  maxZoom: number
  setZoom: (z:number) => void
  setPan: (p:Pt) => void
  zoomAtScreenPoint: (delta:number, focus:Pt) => void
  reset: () => void
  fitToContent: (canvas: {w:number,h:number}, bbox: {x:number,y:number,w:number,h:number}) => void
  worldToScreen: (p:Pt) => Pt
  screenToWorld: (p:Pt) => Pt
}

export const useViewStore = create<ViewState>((set, get) => ({
  zoom: 1,
  pan: { x: 0, y: 0 },
  minZoom: 0.25,
  maxZoom: 4,
  setZoom: (z) => set(s => ({ zoom: Math.min(s.maxZoom, Math.max(s.minZoom, z)) })),
  setPan:  (p) => set({ pan: p }),
  zoomAtScreenPoint: (delta, focus) => {
    const { zoom, minZoom, maxZoom, pan } = get()
    const next = Math.min(maxZoom, Math.max(minZoom, zoom * (1 + delta)))
    if (next === zoom) return
    // keep focus point stable in world coords:
    // world = (screen - pan) / zoom
    const wx = (focus.x - pan.x) / zoom
    const wy = (focus.y - pan.y) / zoom
    // solve new pan so that focus stays under cursor after scaling
    const newPan = { x: focus.x - wx * next, y: focus.y - wy * next }
    set({ zoom: next, pan: newPan })
  },
  reset: () => set({ zoom: 1, pan: { x:0, y:0 } }),
  fitToContent: (canvas, bbox) => {
    const pad = 32
    const zx = (canvas.w - pad*2) / Math.max(1, bbox.w)
    const zy = (canvas.h - pad*2) / Math.max(1, bbox.h)
    const z  = Math.max(0.25, Math.min(4, Math.min(zx, zy)))
    const pan = { x: pad - bbox.x * z + (canvas.w - (bbox.w*z + pad*2))/2,
                  y: pad - bbox.y * z + (canvas.h - (bbox.h*z + pad*2))/2 }
    set({ zoom: z, pan })
  },
  worldToScreen: (p) => {
    const { zoom, pan } = get()
    return { x: p.x * zoom + pan.x, y: p.y * zoom + pan.y }
  },
  screenToWorld: (p) => {
    const { zoom, pan } = get()
    return { x: (p.x - pan.x) / zoom, y: (p.y - pan.y) / zoom }
  },
}))
