'use client'
import React from 'react'
import { PREFS } from '@/lib/japanPrefs'
import { usePrefPaint } from '@/store/prefPaintStore'

export default function PrefGridMap() {
  const painted = usePrefPaint(s => s.painted)
  const toggle = usePrefPaint(s => s.toggle)

  return (
    <div className="grid grid-cols-6 gap-1 text-xs select-none">
      {PREFS.map(({ code, name }) => {
        const on = !!painted[code]
        return (
          <button
            key={code}
            onClick={() => toggle(code)}
            className={[
              'h-9 rounded-md border flex items-center justify-center px-2',
              on ? 'ring-1 ring-blue-500' : '',
            ].join(' ')}
            style={{ background: on ? 'hsl(210 80% 60%)' : 'hsl(0 0% 98%)' }}
            title={`${name} (${code})`}
            aria-pressed={on}
          >
            <span className="truncate">{name}</span>
          </button>
        )
      })}
    </div>
  )
}
