'use client'
import React from 'react'
import { useGridStore } from '@/store/gridStore'

export function GridToolbar() {
  const {
    showGrid, snapGrid, pitch, subDiv, minGapPx,
    setShowGrid, setSnapGrid, setPitch, setSubDiv, setMinGapPx
  } = useGridStore()

  const box = 'px-2 py-1 rounded bg-neutral-900/70 text-neutral-100 flex items-center gap-2'

  return (
    <div className={box}>
      <label className="flex items-center gap-1 text-xs">
        <input type="checkbox" checked={showGrid} onChange={(e)=>setShowGrid(e.target.checked)} />
        Show Grid
      </label>
      <label className="flex items-center gap-1 text-xs">
        <input type="checkbox" checked={snapGrid} onChange={(e)=>setSnapGrid(e.target.checked)} />
        Snap to Grid
      </label>
      <div className="flex items-center gap-1 text-xs">
        pitch
        <input
          type="number" min={1} step={1} value={pitch}
          onChange={(e)=>setPitch(parseInt(e.target.value || '16', 10))}
          className="w-16 bg-neutral-800 rounded px-1 py-[2px]"
        />
        px
      </div>
      <div className="flex items-center gap-1 text-xs">
        subDiv
        <select
          value={subDiv}
          onChange={(e)=>setSubDiv(parseInt(e.target.value, 10))}
          className="bg-neutral-800 rounded px-1 py-[2px]"
        >
          {[2,4,5,10].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-1 text-xs">
        minGap
        <input
          type="number" min={2} step={1} value={minGapPx}
          onChange={(e)=>setMinGapPx(parseInt(e.target.value || '8', 10))}
          className="w-14 bg-neutral-800 rounded px-1 py-[2px]"
        />
        px
      </div>
    </div>
  )
}

