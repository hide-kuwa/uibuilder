'use client'
import React from 'react'
import { PREFS } from '@/lib/japanPrefs'
import { usePrefPaintEnum, STATES } from '@/store/prefPaintEnumStore'
import { STATE_META } from './PrefEnumLegend'

const COLOR = {
  0: 'hsl(0 0% 98%)',
  1: STATE_META[0].color,
  2: STATE_META[1].color,
  3: STATE_META[2].color,
} as const

export default function PrefEnumGridMap() {
  const painted = usePrefPaintEnum(s => s.painted)
  const cycle = usePrefPaintEnum(s => s.cycle)

  return (
    <div className="grid grid-cols-6 gap-1 text-xs select-none">
      {PREFS.map(({ code, name }) => {
        const v = painted[code] ?? 0
        return (
          <button
            key={code}
            onClick={() => cycle(code)}
            className={[
              'h-9 rounded-md border flex items-center justify-center px-2',
              v ? 'ring-1 ring-foreground/30' : '',
            ].join(' ')}
            style={{ background: COLOR[v as keyof typeof COLOR] }}
            title={`${name} (${code})`}
            aria-pressed={v !== STATES.none}
          >
            <span className="truncate">{name}</span>
          </button>
        )
      })}
    </div>
  )
}
