'use client'
import { useInteractionRegistry } from '@/store/interactionRegistry'

export function ActionPresetPicker({ nodeId, value, onChange }:{
  nodeId: string
  value?: string | null
  onChange: (id: string | null) => void
}) {
  const { presets } = useInteractionRegistry()
  return (
    <div className="mt-3">
      <div className="text-xs text-neutral-300 mb-1">Action Preset</div>
      <div className="flex gap-2">
        <select
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm"
          value={value ?? ''}
          onChange={(e)=>onChange(e.target.value || null)}
        >
          <option value="">（なし）</option>
          {presets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <a href="/dev/actions" className="px-2 py-1 bg-neutral-800 rounded text-xs">Open Designer</a>
      </div>
    </div>
  )
}
