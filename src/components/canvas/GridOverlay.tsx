'use client'
import React from 'react'
import { useViewport } from './ViewportStore'

export default function GridOverlay() {
  const { vp } = useViewport()
  if (!vp.showGrid) return null
  const { x, y, zoom, gridCols, gridGutter, gridMaxWidth } = vp
  const colWidth = (gridMaxWidth - gridGutter * (gridCols - 1)) / gridCols
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{ transform: `translate(${x}px, ${y}px) scale(${zoom})`, transformOrigin: '0 0' }}
    >
      <div
        className="h-full mx-auto flex"
        style={{ width: gridMaxWidth, gap: gridGutter }}
      >
        {Array.from({ length: gridCols }).map((_, i) => (
          <div
            key={i}
            className="h-full bg-blue-500/10 border border-blue-500/20"
            style={{ width: colWidth }}
          />
        ))}
      </div>
    </div>
  )
}
