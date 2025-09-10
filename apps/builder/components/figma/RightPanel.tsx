'use client'
import React from 'react'
import { useFigmaStore } from '../../lib/figma/store'
import MotionPanel from './MotionPanel'

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center justify-between py-1 text-sm">
      <span className="text-gray-500">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-40 border rounded px-2 py-1 text-right"
      />
    </label>
  )
}

export default function RightPanel() {
  const selected = useFigmaStore((s) => s.selectedNode)
  if (!selected) return null

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-1 opacity-50 pointer-events-none">
        <div className="text-xs uppercase tracking-wider text-gray-400">Style (v0 stub)</div>
        <NumberInput label="Radius" value={selected.style?.radius ?? 0} onChange={() => {}} />
        <NumberInput label="Opacity" value={selected.style?.opacity ?? 1} onChange={() => {}} />
      </div>
      <MotionPanel />
    </div>
  )
}
