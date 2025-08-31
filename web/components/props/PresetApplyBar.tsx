'use client'
import * as React from 'react'
import { useInteractionRegistry } from '@/store/interactionRegistry'
import { emitApply } from '@/lib/presetChannel'

export default function PresetApplyBar() {
  const { presets } = useInteractionRegistry()
  const [pid, setPid] = React.useState<string>('')
  const [mode, setMode] = React.useState<'replace' | 'append' | 'remove'>('replace')
  return (
    <div className="mt-3 border-t border-neutral-800 pt-2">
      <div className="text-xs text-neutral-300 mb-1">Bulk apply preset</div>
      <div className="flex gap-2">
        <select
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm"
          value={pid}
          onChange={(e) => setPid(e.target.value)}
        >
          <option value="">（選択してください）</option>
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          className="bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm"
          value={mode}
          onChange={(e) => setMode(e.target.value as any)}
        >
          <option value="replace">replace</option>
          <option value="append">append</option>
          <option value="remove">remove</option>
        </select>
      </div>
      <div className="mt-2 flex gap-2">
        <button
          className="px-2 py-1 bg-neutral-800 rounded text-xs"
          onClick={() => emitApply(pid || '', mode, 'selection')}
        >
          Apply to selection
        </button>
        <button
          className="px-2 py-1 bg-neutral-800 rounded text-xs"
          onClick={() => emitApply(pid || '', mode, 'all')}
        >
          Apply to all
        </button>
        <button
          className="px-2 py-1 bg-neutral-800 rounded text-xs"
          onClick={() => emitApply(pid || '', 'replace', 'set-project-default')}
        >
          Set as project default
        </button>
      </div>
    </div>
  )
}
