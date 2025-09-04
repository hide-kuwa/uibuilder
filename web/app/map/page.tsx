'use client'
import { useSearchParams } from 'next/navigation'
import { useBuilderStore } from '@/stores/builder'
import { computeBgColor, buildMotionFromStatus } from '@/lib/status-engine'

export default function MapPage() {
  const sp = useSearchParams()
  const preview = sp.get('preview') === '1'
  const nodes = useBuilderStore(s => Object.values(s.getMapNodes(preview)))
  const cfg = useBuilderStore(s=> s.statusConfig)

  return (
    <div className="p-4">
      <div className="mb-3 text-sm text-gray-600">
        表示データ: {preview ? 'プレビュー（ドラフト）' : '公開スナップショット'}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {nodes.map(n => {
          const status = n.status ?? { base: 'notVisited', overlays: [] }
          const color = computeBgColor(status, cfg)
          const effects = buildMotionFromStatus(n.id, status, cfg)
          return (
            <div key={n.id} className="rounded-lg border p-3" style={{ backgroundColor: color }}>
              <div className="text-sm font-medium">{n.title ?? n.prefecture ?? n.id}</div>
              <div className="text-xs text-gray-600">base: {status.base} / overlays: {status.overlays.join(', ') || 'なし'}</div>
              {/* effects は既存 runMotion に渡してもOK */}
            </div>
          )
        })}
      </div>
    </div>
  )
}
