'use client'
import React from 'react'
import { useBuilderStore } from '@/store/builderStore'

export function CanvasOverlay() {
  const guides = useBuilderStore((s) => s.ui.guides)
  if (!guides.length) return null
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {guides.map((g, i) =>
        g.axis === 'x' ? (
          <div
            key={i}
            className="absolute top-0 bottom-0 border-l border-amber-400/70"
            style={{ left: g.pos }}
          />
        ) : (
          <div
            key={i}
            className="absolute left-0 right-0 border-t border-amber-400/70"
            style={{ top: g.pos }}
          />
        ),
      )}
    </div>
  )
}

