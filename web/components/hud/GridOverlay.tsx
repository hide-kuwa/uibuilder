'use client'
import React from 'react'
import { useHudStore } from '@/store/hudStore'

export function GridOverlay() {
  const show = useHudStore((s) => s.showGrid)
  const zoom = useHudStore((s) => s.zoom)
  if (!show) return null

  const base = 8 * zoom
  const fine = Math.max(1, base)

  return (
    <div
      className="pointer-events-none absolute inset-0 z-40"
      style={{
        backgroundImage: `
          linear-gradient(0deg, rgba(148,163,184,0.12) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)
        `,
        backgroundSize: `${fine}px ${fine}px`,
      }}
    />
  )
}
