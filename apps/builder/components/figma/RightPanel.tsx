'use client'
import React from 'react'
import { useFigmaStore } from '../../lib/figma/store'
import MotionPanel from './MotionPanel'

function NumberInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex items-center justify-between py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-40 border rounded px-2 py-1 text-right"
      />
    </label>
  )
}

export default function RightPanel() {
  const selected = useFigmaStore((s) => s.selectedNode)
  const setNodeRect = useFigmaStore((s) => s.setNodeRect)

  if (!selected) {
    return (
      <div className="p-4 text-sm text-gray-500">
        <div className="font-semibold text-gray-700 mb-2">Properties</div>
        <p>No selection</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">
          Selection
        </div>
        <div className="text-sm font-medium text-gray-800">
          {selected.name || selected.type}{' '}
          <span className="text-gray-400">({selected.type})</span>
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wider text-gray-400">
          Position
        </div>
        <NumberInput
          label="X"
          value={selected.x}
          onChange={(n) => setNodeRect(selected.id, { x: n })}
        />
        <NumberInput
          label="Y"
          value={selected.y}
          onChange={(n) => setNodeRect(selected.id, { y: n })}
        />
      </div>
      <div className="space-y-1">
        <div className="text-xs uppercase tracking-wider text-gray-400">
          Size
        </div>
        <NumberInput
          label="W"
          value={selected.width}
          onChange={(n) => setNodeRect(selected.id, { width: n })}
        />
        <NumberInput
          label="H"
          value={selected.height}
          onChange={(n) => setNodeRect(selected.id, { height: n })}
        />
      </div>
      <div className="space-y-1 opacity-50 pointer-events-none">
        <div className="text-xs uppercase tracking-wider text-gray-400">
          Style (v0 stub)
        </div>
        <NumberInput
          label="Radius"
          value={selected.style?.radius ?? 0}
          onChange={() => {}}
        />
        <NumberInput
          label="Opacity"
          value={selected.style?.opacity ?? 1}
          onChange={() => {}}
        />
      </div>
      <MotionPanel />
    </div>
  )
}
