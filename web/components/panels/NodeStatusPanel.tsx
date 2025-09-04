'use client'
import type { BaseStatus, Overlay, NodeStatus } from '@/types/status'
import { computeBgColor } from '@/lib/status-engine'

const BASES: { key: BaseStatus; label: string }[] = [
  { key: 'visited', label: '行った' },
  { key: 'resident', label: '住んでる' },
  { key: 'notVisited', label: '行ってない' },
]
const OVS: { key: Overlay; label: string }[] = [
  { key: 'want', label: '行きたい（ブースト）' },
  { key: 'hasPhotos', label: '写真あり（ブースト）' },
]

export default function NodeStatusPanel({
  value,
  onChange,
}: {
  value: NodeStatus
  onChange: (v: NodeStatus) => void
}) {
  const bg = computeBgColor(value)

  return (
    <div className="rounded-2xl border bg-white p-4">
      <div className="mb-2 text-sm font-medium text-gray-700">Status (node)</div>

      <div className="mb-2 text-xs text-gray-500">ベース</div>
      <div className="grid grid-cols-3 gap-2">
        {BASES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onChange({ ...value, base: key })}
            className={`rounded-md border px-2 py-1 text-sm ${value.base === key ? 'border-indigo-400 bg-indigo-50' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-3 text-xs text-gray-500">ブースト（複数可）</div>
      <div className="flex flex-wrap gap-2">
        {OVS.map(({ key, label }) => {
          const on = value.overlays.includes(key)
          return (
            <label key={key} className="inline-flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={on}
                onChange={() => {
                  const overlays = on ? value.overlays.filter(k => k !== key) : [...value.overlays, key]
                  onChange({ ...value, overlays })
                }}
              />
              <span>{label}</span>
            </label>
          )
        })}
      </div>

      <div className="mt-4 rounded-md border p-3 text-xs">
        <div className="mb-1 text-gray-500">プレビュー（背景色）</div>
        <div className="h-10 rounded" style={{ backgroundColor: bg }} />
      </div>
    </div>
  )
}
