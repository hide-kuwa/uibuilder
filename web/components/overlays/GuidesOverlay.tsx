'use client'
import React, { memo } from 'react'
import { useGuidesStore } from '@/store/guidesStore'

/** 画面→SVG変換など既存の座標系があればそれを使用。
 * ここではシンプルにワールド(px)＝SVG座標として描く例。
 */
export const GuidesOverlay = memo(function GuidesOverlay({
  width,
  height,
  active = [],
}: {
  width: number
  height: number
  active?: { axis: 'x'|'y'; at: number }[]
}) {
  const { guides, visible } = useGuidesStore((s) => ({ guides: s.guides, visible: s.visible }))
  if (!visible) return null

  const activeKey = (g: {axis:'x'|'y'; at:number}) => `${g.axis}:${Math.round(g.at)}`

  const activeMap = new Set(active.map(activeKey))
  return (
    <svg className="pointer-events-none absolute inset-0" width={width} height={height}>
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
    </svg>
  )
})
