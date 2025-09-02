'use client'
import React from 'react'

export type PrefCode = string // e.g. '13' for Tokyo
export type JapanMapProps = {
  valuesByPref?: Record<PrefCode, number>
  selected?: PrefCode | null
  onSelect?: (pref: PrefCode) => void
}

const PREFS: PrefCode[] = [
  '01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47'
]

export default function JapanMap({ valuesByPref, selected, onSelect }: JapanMapProps) {
  const safeValues: Record<PrefCode, number> = valuesByPref ?? {}
  const maxVal = PREFS.reduce((m, p) => Math.max(m, safeValues[p] ?? 0), 0)

  return (
    <div className="grid grid-cols-6 gap-1 text-xs select-none">
      {PREFS.map((code) => {
        const v = safeValues[code] ?? 0
        const intensity = maxVal > 0 ? Math.round((v / maxVal) * 90) : 0
        const isSel = selected === code
        return (
          <button
            key={code}
            onClick={() => onSelect?.(code)}
            className={[
              'h-8 rounded-md border flex items-center justify-center',
              isSel ? 'ring-2 ring-blue-500' : '',
            ].join(' ')}
            style={{ background: `hsl(210 70% ${100 - intensity}%)` }}
            aria-pressed={isSel}
            title={`pref:${code} value:${v}`}
          >
            {code}
          </button>
        )
      })}
    </div>
  )
}
