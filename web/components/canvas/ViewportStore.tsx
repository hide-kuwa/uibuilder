'use client'
import React, { createContext, useContext, useState } from 'react'

export type DeviceKind = 'mobile' | 'tablet' | 'desktop'

type VP = {
  zoom: number
  x: number
  y: number
  showGrid: boolean
  showRulers: boolean
  snapOn: boolean
  gridCols: number
  gridGutter: number
  gridMaxWidth: number
  device: DeviceKind
}

const Ctx = createContext<{
  vp: VP
  setZoom: (z: number) => void
  panBy: (dx: number, dy: number) => void
  toggle: (k: 'showGrid' | 'showRulers' | 'snapOn') => void
  setGrid: (cols: number, gutter: number, maxWidth: number) => void
  setDevice: (d: DeviceKind) => void
} | null>(null)

export const ViewportProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [vp, set] = useState<VP>({
    zoom: 1,
    x: 0,
    y: 0,
    showGrid: false,
    showRulers: false,
    snapOn: true,
    gridCols: 12,
    gridGutter: 16,
    gridMaxWidth: 1280,
    device: 'desktop',
  })
  const setZoom = (z: number) => set((s) => ({ ...s, zoom: Math.min(4, Math.max(0.25, z)) }))
  const panBy = (dx: number, dy: number) => set((s) => ({ ...s, x: s.x + dx, y: s.y + dy }))
  const toggle = (k: any) => set((s) => ({ ...s, [k]: !s[k] }))
  const setGrid = (cols: number, gutter: number, maxWidth: number) =>
    set((s) => ({ ...s, gridCols: cols, gridGutter: gutter, gridMaxWidth: maxWidth }))
  const setDevice = (d: DeviceKind) => set((s) => ({ ...s, device: d }))
  return <Ctx.Provider value={{ vp, setZoom, panBy, toggle, setGrid, setDevice }}>{children}</Ctx.Provider>
}

export const useViewport = () => {
  const c = useContext(Ctx)
  if (!c) throw new Error('vp')
  return c
}
