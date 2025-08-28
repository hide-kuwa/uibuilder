'use client'
import React, { memo } from 'react'
import type { SmartGuide } from '@/hooks/useSmartSnap'

export const SmartGuidesOverlay = memo(function SmartGuidesOverlay({
  width, height, active = [],
}: { width:number; height:number; active: SmartGuide[] }) {
  if (!active.length) return null
  return (
    <svg className="pointer-events-none absolute inset-0" width={width} height={height}>
      {active.map((g, i) => {
        const stroke = 'rgba(236, 72, 153, 1)' // magenta系
        const dash   = g.kind === 'equal' ? '4,4' : '0'
        if (g.axis === 'x') {
          return <line key={i} x1={g.at} y1={0} x2={g.at} y2={height} stroke={stroke} strokeWidth={1} strokeDasharray={dash} />
        }
        if (g.axis === 'y') {
          return <line key={i} x1={0} y1={g.at} x2={width} y2={g.at} stroke={stroke} strokeWidth={1} strokeDasharray={dash} />
        }
        // equal width/height は簡易にラベルだけ（将来拡張用）
        return null
      })}
    </svg>
  )
})

