'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type DeviceKind = 'free' | 'desktop' | 'tablet' | 'mobile'

type HudState = {
  zoom: number
  minZoom: number
  maxZoom: number
  showGrid: boolean
  showRulers: boolean
  showOutline: boolean
  snapToPixel: boolean
  device: DeviceKind
  setZoom: (z: number) => void
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
  setDevice: (d: DeviceKind) => void
  toggleGrid: () => void
  toggleRulers: () => void
  toggleOutline: () => void
  toggleSnap: () => void
}

export const useHudStore = create<HudState>()(
  persist(
    (set, get) => ({
      zoom: 1,
      minZoom: 0.25,
      maxZoom: 2,
      showGrid: false,
      showRulers: false,
      showOutline: false,
      snapToPixel: true,
      device: 'free',
      setZoom: (z) => {
        const { minZoom, maxZoom } = get()
        const clamped = Math.min(maxZoom, Math.max(minZoom, z))
        set({ zoom: Number(clamped.toFixed(2)) })
      },
      zoomIn: () => {
        const { zoom, setZoom } = get()
        setZoom(zoom * 1.2)
      },
      zoomOut: () => {
        const { zoom, setZoom } = get()
        setZoom(zoom / 1.2)
      },
      resetZoom: () => set({ zoom: 1 }),
      setDevice: (d) => set({ device: d }),
      toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
      toggleRulers: () => set((s) => ({ showRulers: !s.showRulers })),
      toggleOutline: () => set((s) => ({ showOutline: !s.showOutline })),
      toggleSnap: () => set((s) => ({ snapToPixel: !s.snapToPixel })),
    }),
    {
      name: 'ui-hud',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        zoom: s.zoom,
        showGrid: s.showGrid,
        showRulers: s.showRulers,
        showOutline: s.showOutline,
        snapToPixel: s.snapToPixel,
        device: s.device,
      }),
    },
  ),
)
