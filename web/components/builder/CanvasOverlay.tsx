'use client'
import React from 'react'
import { useBuilderStore } from '@/store/builderStore'

export function CanvasOverlay() {
  const guides = useBuilderStore((s) => s.ui.guides)
  const selectedIds = useBuilderStore((s) => s.selectedIds)
  const align = useBuilderStore((s) => s.align)
  const showToolbar = selectedIds.length > 1
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
      {showToolbar && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-auto">
          {(
            [
              ['left', 'L'],
              ['centerX', 'CX'],
              ['right', 'R'],
              ['top', 'T'],
              ['centerY', 'CY'],
              ['bottom', 'B'],
              ['hSpace', 'HS'],
              ['vSpace', 'VS'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => align(k)}
              className="px-1 py-0.5 text-xs bg-zinc-800 border border-zinc-600 rounded text-amber-200"
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

