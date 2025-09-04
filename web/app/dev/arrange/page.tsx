'use client'
import ZoomPanCanvas from '@/components/canvas/ZoomPanCanvas'
import DraggableNode from '@/components/canvas/DraggableNode'
import { useCanvasStore } from '@/stores/canvas'
import { useBuilderStore } from '@/store/builderStore'
import Link from 'next/link'

const builderStore = useBuilderStore as any

export default function ArrangePage() {
  const selectedIds = useBuilderStore(s => (s as any).selectedIds)
  const nodes = useBuilderStore(s => Object.values((s as any).nodes ?? {}))
  const setNodePos = useCanvasStore(s => s.setNodePos)

  // Builder のノードモデルに position を保存する（Publishに乗るように）
  const commit = (id: string) => (xy: { x: number; y: number }) => {
    builderStore.getState?.().updateNode?.(id, (prev: any) => ({ ...prev, position: xy }))
  }

  // 初期位置：ノードに position があればそれを使う
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">Arrange prefectures (Zoom / Pan / Drag)</div>
        <div className="flex gap-2">
          <Link href="/builder" className="rounded-md border px-3 py-2 text-sm">← Builder</Link>
          <Link href="/map" className="rounded-md border px-3 py-2 text-sm">Open /map</Link>
        </div>
      </div>

      <ZoomPanCanvas>
        {/* ワールド内にノードを並べる */}
        {nodes.map((n: any, i: number) => (
          <DraggableNode
            key={n.id}
            id={n.id}
            label={n.title ?? n.prefecture ?? `node ${i + 1}`}
            initial={n.position ?? { x: (i % 8) * 160, y: Math.floor(i / 8) * 120 }}
            status={n.status}
            onCommit={commit(n.id)}
          />
        ))}
      </ZoomPanCanvas>
    </div>
  )
}
