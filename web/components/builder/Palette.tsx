'use client'
import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { ElmType } from '@/store/builderStore'

function DraggableItem({ type, label }: { type: ElmType; label: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `pal_${type}`,
    data: { from: 'palette', type },
  })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`text-xs px-2 py-1 rounded border border-zinc-700 hover:bg-zinc-800 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-60' : ''
      }`}
    >
      {label}
    </div>
  )
}

export function Palette() {
  const items: { type: ElmType; label: string }[] = [
    { type: 'header', label: 'Header' },
    { type: 'footer', label: 'Footer' },
    { type: 'sidebar', label: 'Sidebar' },
    { type: 'hud', label: 'HUD' },
    { type: 'container', label: 'Container' },
    { type: 'button', label: 'Button' },
    { type: 'text', label: 'Text' },
  ]
  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((it) => (
        <DraggableItem key={it.type} type={it.type} label={it.label} />
      ))}
      <p className="col-span-2 text-[11px] text-zinc-400 mt-2">
        パレットからキャンバスへドラッグ＆ドロップで配置できます
      </p>
    </div>
  )
}

