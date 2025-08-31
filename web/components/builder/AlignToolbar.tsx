'use client'
import React from 'react'
import { useBuilderStore } from '@/store/builderStore'
import { alignSelected, distributeSelected } from '@/lib/alignActions'

export function AlignToolbar() {
  const selected = useBuilderStore(s=>s.selectedIds) || []
  const [anchor, setAnchor] = React.useState<'first'|'selection'>('first')
  const canAlign = selected.length >= 2
  const canDist = selected.length >= 3
  return (
    <div className="flex items-center gap-1">
      <select className="border rounded h-7 text-xs px-1" value={anchor} onChange={(e)=>setAnchor(e.target.value as any)}>
        <option value="first">Anchor: First</option>
        <option value="selection">Anchor: Selection</option>
      </select>
      <button className="border rounded px-2 h-7 disabled:opacity-50" disabled={!canAlign} onClick={()=>alignSelected('left', anchor)}>L</button>
      <button className="border rounded px-2 h-7 disabled:opacity-50" disabled={!canAlign} onClick={()=>alignSelected('hcenter', anchor)}>HC</button>
      <button className="border rounded px-2 h-7 disabled:opacity-50" disabled={!canAlign} onClick={()=>alignSelected('right', anchor)}>R</button>
      <div className="w-[6px]" />
      <button className="border rounded px-2 h-7 disabled:opacity-50" disabled={!canAlign} onClick={()=>alignSelected('top', anchor)}>T</button>
      <button className="border rounded px-2 h-7 disabled:opacity-50" disabled={!canAlign} onClick={()=>alignSelected('vcenter', anchor)}>VC</button>
      <button className="border rounded px-2 h-7 disabled:opacity-50" disabled={!canAlign} onClick={()=>alignSelected('bottom', anchor)}>B</button>
      <div className="w-[6px]" />
      <button className="border rounded px-2 h-7 disabled:opacity-50" disabled={!canDist} onClick={()=>distributeSelected('hgap', 'selection')}>H-Distribute</button>
      <button className="border rounded px-2 h-7 disabled:opacity-50" disabled={!canDist} onClick={()=>distributeSelected('vgap', 'selection')}>V-Distribute</button>
    </div>
  )
}

