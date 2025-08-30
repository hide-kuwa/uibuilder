'use client'
import React from 'react'
import { useBuilderStore } from '@/store/builderStore'
import { useGuidesStore } from '@/store/guidesStore'
import { Toolbar } from './Toolbar'
import { useViewStore } from '@/store/viewStore'

export function CanvasOverlay({
  marquee,
}: {
  marquee?: { x: number; y: number; w: number; h: number }
}) {
  const snapGuides = useBuilderStore((s) => s.ui.guides)
  const selectedIds = useBuilderStore((s) => s.selectedIds)
  const align = useBuilderStore((s) => s.align)
  const showAlign = selectedIds.length > 1
  const guides = useGuidesStore((s) => s.guides.filter((g) => g.visible))
  const worldToScreen = useViewStore((s) => s.worldToScreen)
  const zoom = useViewStore((s) => s.zoom)
  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {marquee && (
        <div
          className="absolute border border-amber-400/70 bg-amber-400/10"
          style={{
            left: worldToScreen({ x: marquee.x, y: marquee.y }).x,
            top: worldToScreen({ x: marquee.x, y: marquee.y }).y,
            width: marquee.w * zoom,
            height: marquee.h * zoom,
          }}
        />
      )}
      {guides.map((g) =>
        g.axis === 'x' ? (
          <div
            key={g.id}
            className={`absolute top-0 bottom-0 border-l ${g.locked ? 'border-red-400 border-dashed' : 'border-amber-400/70'}`}
            style={{ left: worldToScreen({ x: g.pos, y: 0 }).x }}
          />
        ) : (
          <div
            key={g.id}
            className={`absolute left-0 right-0 border-t ${g.locked ? 'border-red-400 border-dashed' : 'border-amber-400/70'}`}
            style={{ top: worldToScreen({ x: 0, y: g.pos }).y }}
          />
        ),
      )}
      {snapGuides.map((g, i) =>
        g.axis === 'x' ? (
          <div
            key={`snap-${i}`}
            className="absolute top-0 bottom-0 border-l border-sky-400/70"
            style={{ left: worldToScreen({ x: g.pos, y: 0 }).x }}
          />
        ) : (
          <div
            key={`snap-${i}`}
            className="absolute left-0 right-0 border-t border-sky-400/70"
            style={{ top: worldToScreen({ x: 0, y: g.pos }).y }}
          />
        ),
      )}
      <Toolbar align={align} showAlign={showAlign} />
    </div>
  )
}

