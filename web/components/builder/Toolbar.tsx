'use client'
import React from 'react'
import { useGridStore } from '@/store/gridStore'
import { useGuidesStore } from '@/store/guidesStore'

export function Toolbar({
  align,
  showAlign,
}: {
  align: (kind:
    | 'left'
    | 'centerX'
    | 'right'
    | 'top'
    | 'centerY'
    | 'bottom'
    | 'hSpace'
    | 'vSpace') => void
  showAlign: boolean
}) {
  const { visible, snap, size, setVisible, setSnap, setSize } = useGridStore()
  const { snapPx, setSnapPx } = useGuidesStore((s) => ({ snapPx: s.snapPx, setSnapPx: s.setSnapPx }))
  return (
    <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1 pointer-events-auto">
      <button
        onClick={() => setVisible(!visible)}
        className={`px-1 py-0.5 text-xs bg-zinc-800 border border-zinc-600 rounded text-amber-200 ${
          visible ? '' : 'opacity-50'
        }`}
      >
        Grid
      </button>
      <button
        onClick={() => setSnap(!snap)}
        className={`px-1 py-0.5 text-xs bg-zinc-800 border border-zinc-600 rounded text-amber-200 ${
          snap ? '' : 'opacity-50'
        }`}
      >
        Snap
      </button>
      <select
        value={size}
        onChange={(e) => setSize(parseInt(e.target.value, 10))}
        className="px-1 py-0.5 text-xs bg-zinc-800 border border-zinc-600 rounded text-amber-200"
      >
        {[4, 8, 12, 16].map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
      <div className="flex items-center gap-1 text-xs">
        snap
        <input
          type="number"
          value={snapPx}
          onChange={(e) => setSnapPx(parseInt(e.target.value || '0', 10))}
          className="w-14 bg-neutral-800 rounded px-1 py-[2px]"
        />
        px
      </div>
      {showAlign && (
        <>
          <div className="mx-1 w-px bg-zinc-600" />
          {(
            [
              ['left', 'L'],
              ['centerX', 'CX'],
              ['right', 'R'],
              ['top', 'T'],
              ['centerY', 'CY'],
              ['bottom', 'B'],
              ['hSpace', 'HS'],
              ['vSpace', 'VS'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              onClick={() => align(k)}
              className="px-1 py-0.5 text-xs bg-zinc-800 border border-zinc-600 rounded text-amber-200"
            >
              {label}
            </button>
          ))}
        </>
      )}
    </div>
  )
}
