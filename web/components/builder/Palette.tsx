'use client'
import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import { listDefs } from '@/lib/registry'
function Item({ comp }: { comp: { key: string; label: string } }) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: 'palette:' + comp.key,
    data: { from: 'palette', type: 'instance', meta: { componentId: comp.key } },
  })
  return (
    <button ref={setNodeRef} {...attributes} {...listeners} className="w-full text-left px-2 py-1 border border-zinc-700 rounded hover:bg-zinc-800" title={comp.key}>
      {comp.label}
    </button>
  )
}
export function Palette() {
  const defs = listDefs()
  return (
    <div className="space-y-2">
      <div className="text-xs opacity-70">Elements</div>
      <div className="grid grid-cols-1 gap-2">
        {defs.map((d) => <Item key={d.key} comp={d} />)}
      </div>
    </div>
  )
}
export default Palette
