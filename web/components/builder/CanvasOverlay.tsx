'use client'
import React from 'react'
import { useBuilderStore } from '@/store/builderStore'
import { useGuidesStore } from '@/store/guidesStore'
import { Toolbar } from './Toolbar'

export function CanvasOverlay() {
  const snapGuides = useBuilderStore((s) => s.ui.guides)
  const selectedIds = useBuilderStore((s) => s.selectedIds)
  const align = useBuilderStore((s) => s.align)
  const showAlign = selectedIds.length > 1
  const guides = useGuidesStore((s) => s.guides.filter((g) => g.visible))
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {guides.map((g) =>
        g.axis === 'x' ? (
          <div
            key={g.id}
            className={`absolute top-0 bottom-0 border-l ${g.locked ? 'border-red-400 border-dashed' : 'border-amber-400/70'}`}
            style={{ left: g.pos }}
          />
        ) : (
          <div
            key={g.id}
            className={`absolute left-0 right-0 border-t ${g.locked ? 'border-red-400 border-dashed' : 'border-amber-400/70'}`}
            style={{ top: g.pos }}
          />
        ),
      )}
      {snapGuides.map((g, i) =>
        g.axis === 'x' ? (
          <div
            key={`snap-${i}`}
            className="absolute top-0 bottom-0 border-l border-sky-400/70"
            style={{ left: g.pos }}
          />
        ) : (
          <div
            key={`snap-${i}`}
            className="absolute left-0 right-0 border-t border-sky-400/70"
            style={{ top: g.pos }}
          />
        ),
      )}
      <Toolbar align={align} showAlign={showAlign} />
    </div>
  )
}

