'use client'
import { useInteractionRegistry } from '@/store/interactionRegistry'

export function ActionPresetPicker({ nodeId, valueIds, onChange }:{
  nodeId: string
  valueIds?: string[]
  onChange: (ids: string[]) => void
}) {
  const { presets } = useInteractionRegistry()
  const ids = valueIds ?? []

  const add = (id: string) => onChange(Array.from(new Set([...ids, id])))
  const remove = (id: string) => onChange(ids.filter(x => x !== id))

  return (
    <div className="mt-3">
      <div className="text-xs text-neutral-300 mb-1">Action Presets</div>
      <div className="flex gap-2">
        <select
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded px-2 py-1 text-sm"
          onChange={(e)=> e.target.value && add(e.target.value)}
          value=""
        >
          <option value="">（追加…）</option>
          {presets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <a href="/dev/actions" className="px-2 py-1 bg-neutral-800 rounded text-xs">Open Designer</a>
      </div>

      {/* 適用中のプリセット（削除可能） */}
      <div className="mt-2 flex flex-wrap gap-1">
        {ids.map(id => {
          const p = presets.find(x => x.id === id)
          return (
            <span key={id} className="px-2 py-[2px] rounded bg-neutral-800 text-xs">
              {p?.name ?? id}
              <button className="ml-1 text-rose-300" onClick={()=>remove(id)}>×</button>
            </span>
          )
        })}
        {!ids.length && <span className="text-[11px] text-neutral-500">（未適用）</span>}
      </div>
    </div>
  )
}
