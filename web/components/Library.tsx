"use client"
import { registry } from '../lib/registry'

export default function Library() {
  return (
    <div className="p-2 space-y-2">
      {Object.keys(registry).map(name => (
        <div
          key={name}
          draggable
          onDragStart={e => e.dataTransfer.setData('text/plain', name)}
          className="p-1 border rounded cursor-move"
        >
          {name}
        </div>
      ))}
    </div>
  )
}
