'use client'
import React from 'react'
export const STATE_META = [
  { v: 1, label: '行きたい', color: 'hsl(38 92% 55%)' },   // amber-ish
  { v: 2, label: '行った',   color: 'hsl(217 91% 60%)' },  // blue-ish
  { v: 3, label: '住んだ',   color: 'hsl(0 84% 60%)' },    // red-ish
] as const

export default function PrefEnumLegend() {
  return (
    <div className="flex gap-3 text-xs">
      {STATE_META.map(s => (
        <div key={s.v} className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm border" style={{ background: s.color }} />
          <span className="text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
