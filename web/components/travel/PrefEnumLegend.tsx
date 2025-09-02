'use client'
import React from 'react'

export const STATE_META = [
  { v: 1, label: '行きたい', color: 'hsl(38 92% 55%)' },
  { v: 2, label: '行った', color: 'hsl(217 91% 60%)' },
  { v: 3, label: '住んだ', color: 'hsl(0 84% 60%)' },
] as const

export type Palette = { want: string; visited: string; lived: string }

export default function PrefEnumLegend({ palette }: { palette?: Partial<Palette> }) {
  const pal: Palette = {
    want: STATE_META[0].color,
    visited: STATE_META[1].color,
    lived: STATE_META[2].color,
    ...palette,
  }
  const items = [
    { v: 1, label: '行きたい', color: pal.want },
    { v: 2, label: '行った', color: pal.visited },
    { v: 3, label: '住んだ', color: pal.lived },
  ]
  return (
    <div className="flex gap-3 text-xs">
      {items.map((s) => (
        <div key={s.v} className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded-sm border" style={{ background: s.color }} />
          <span className="text-muted-foreground">{s.label}</span>
        </div>
      ))}
    </div>
  )
}
