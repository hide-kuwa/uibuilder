'use client'
import React, { memo } from 'react'
import { useGuidesStore } from '@/store/guidesStore'

type Active = { axis: 'x'|'y'; at: number }
type ScreenToWorld = (p: number, axis: 'x'|'y') => number

export const GuidesOverlay = memo(function GuidesOverlay({
  width,
  height,
  active = [],
  canvasRef,
  screenToWorld,
}: {
  width: number
  height: number
  active?: Active[]
  canvasRef?: React.RefObject<HTMLElement>
  screenToWorld?: ScreenToWorld
}) {
  const { guides, visible, locked, preview, moveGuide, removeGuide } = useGuidesStore((s) => ({
    guides: s.guides, visible: s.visible, locked: s.locked,
    preview: s.preview,
    moveGuide: s.moveGuide, removeGuide: s.removeGuide,
  }))
  if (!visible) return null

  const toWorld: ScreenToWorld = (p, axis) => {
    if (!canvasRef?.current) return p
    if (screenToWorld) return screenToWorld(p, axis)
    const r = canvasRef.current.getBoundingClientRect()
    return axis === 'x' ? (p - r.left) : (p - r.top)
  }

  const activeKey = (g: Active) => `${g.axis}:${Math.round(g.at)}`
  const activeMap = new Set(active.map(activeKey))

  const startDrag = (gId: string, axis: 'x'|'y') => (e: React.MouseEvent<SVGLineElement>) => {
    if (locked) return
    e.preventDefault()
    const onMove = (ev: MouseEvent) => moveGuide(gId, toWorld(axis === 'x' ? ev.clientX : ev.clientY, axis))
    const onUp = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const onContext = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault()
    removeGuide(id)
  }

  return (
    <div className="absolute inset-0">
      {/* ▼ ビジュアル（非インタラクティブ） */}
      <svg className="absolute inset-0 pointer-events-none" width={width} height={height}>
        {guides.map((g) => {
          const key = `${g.axis}:${Math.round(g.pos)}`
          const isActive = activeMap.has(key)
          const stroke = isActive ? 'rgba(32,148,243,1)' : 'rgba(32,148,243,.5)'
          const dash = isActive ? '0' : '6,6'
          return g.axis === 'x' ? (
            <line key={key} x1={g.pos} y1={0} x2={g.pos} y2={height} stroke={stroke} strokeWidth={1} strokeDasharray={dash} />
          ) : (
            <line key={key} x1={0} y1={g.pos} x2={width} y2={g.pos} stroke={stroke} strokeWidth={1} strokeDasharray={dash} />
          )
        })}
        {preview && (
          preview.axis === 'x' ? (
            <line x1={preview.pos} y1={0} x2={preview.pos} y2={height} stroke="rgba(255,255,255,.9)" strokeWidth={1} strokeDasharray="2,2" />
          ) : (
            <line x1={0} y1={preview.pos} x2={width} y2={preview.pos} stroke="rgba(255,255,255,.9)" strokeWidth={1} strokeDasharray="2,2" />
          )
        )}
      </svg>

      {/* ▼ インタラクティブ（太いヒットエリア） */}
      <div className="absolute inset-0 pointer-events-auto">
        <svg className="absolute inset-0" width={width} height={height}>
          {guides.map((g) => {
            // 透明の太い線をヒットエリアに（見た目は上のSVGが担う）
            const common = {
              onMouseDown: startDrag(g.id, g.axis),
              onContextMenu: onContext(g.id),
              style: { cursor: g.axis === 'x' ? 'col-resize' as const : 'row-resize' as const },
              stroke: 'rgba(0,0,0,0)', // 透明
              strokeWidth: 12,        // 太いヒット
            }
            return g.axis === 'x' ? (
              <line key={g.id} x1={g.pos} y1={0} x2={g.pos} y2={height} {...common} />
            ) : (
              <line key={g.id} x1={0} y1={g.pos} x2={width} y2={g.pos} {...common} />
            )
          })}
        </svg>
      </div>
    </div>
  )
})

