'use client'
import { useBuilderStore } from '@/stores/builder'
import type { NodeStatus, BaseStatus, Overlay } from '@/types/status'

const BASES: { key: BaseStatus; label: string }[] = [
  { key: 'visited', label: '行った' },
  { key: 'resident', label: '住んでる' },
  { key: 'notVisited', label: '行ってない' },
]
const OVERS: { key: Overlay; label: string }[] = [
  { key: 'want', label: '行きたい' },
  { key: 'hasPhotos', label: '写真あり' },
]

export default function StatusDropdown({ nodeId }: { nodeId: string }) {
  const node = useBuilderStore(s => s.nodes[nodeId])
  const setNodeStatus = useBuilderStore(s => s.setNodeStatus)
  const cfg = useBuilderStore(s => s.statusConfig)

  const status: NodeStatus = node?.status ?? { base: 'notVisited', overlays: [] }
  const setBase = (b: BaseStatus) => setNodeStatus(nodeId, { ...status, base: b })
  const toggleOv = (o: Overlay) => {
    const exists = status.overlays.includes(o)
    const overlays = exists ? status.overlays.filter(x=>x!==o) : [...status.overlays, o]
    setNodeStatus(nodeId, { ...status, overlays })
  }

  return (
    <div className="rounded-lg border bg-white p-3 text-sm">
      <div className="mb-1 text-xs text-gray-500">ステータス</div>
      <select
        value={status.base}
        onChange={(e)=> setBase(e.target.value as BaseStatus)}
        className="w-full rounded border px-2 py-1"
        style={{ backgroundColor: cfg.base[status.base]?.color }}
      >
        {BASES.map(b => <option key={b.key} value={b.key}>{b.label}</option>)}
      </select>

      <div className="mt-2 space-y-1">
        {OVERS.map(o => {
          const checked = status.overlays.includes(o.key)
          const color = cfg.overlay[o.key]?.color
          return (
            <label key={o.key} className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={checked} onChange={()=> toggleOv(o.key)} />
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: color }} />
                {o.label}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}
