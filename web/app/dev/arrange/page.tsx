'use client'
import ZoomPanCanvas from '@/components/canvas/ZoomPanCanvas'
import DraggableNode from '@/components/canvas/DraggableNode'
import SelectionMarquee from '@/components/canvas/SelectionMarquee'
import SmartGuides from '@/components/canvas/SmartGuides'
import { useCanvasStore } from '@/stores/canvas'
import { useBuilderStore, builderStore } from '@/stores/builder'
import Link from 'next/link'
import { useRef } from 'react'

export default function ArrangePage() {
  const nodes = useBuilderStore(s => Object.values(s.nodes ?? {}))
  const selectedIds = useCanvasStore(s => s.selectedIds)
  const { nodePos } = useCanvasStore()
  const setTransform = useCanvasStore(s => s.setTransform)

  // 矢印キーは前ステップのまま…

  // レイヤー操作
  const bringToFront = () => {
    if (!selectedIds.length) return
    for (const id of selectedIds) {
      builderStore.getState().bringToFront(id)
    }
  }
  const sendToBack = () => {
    if (!selectedIds.length) return
    for (const id of selectedIds) {
      builderStore.getState().sendToBack(id)
    }
  }
  const lockToggle = (lock: boolean) => {
    for (const id of selectedIds) {
      builderStore.getState().setLocked(id, lock)
    }
  }

  const fitRef = useRef<HTMLDivElement | null>(null)
  const onFit = () => {
    const el = fitRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const padding = 40
    const positions = nodes.map(n => nodePos[n.id] ?? n.position ?? { x: 0, y: 0 })
    if (!positions.length) return
    const xs = positions.map(p => p.x)
    const ys = positions.map(p => p.y)
    const minX = Math.min(...xs), maxX = Math.max(...xs)
    const minY = Math.min(...ys), maxY = Math.max(...ys)
    const contentW = (maxX - minX) + 160
    const contentH = (maxY - minY) + 96
    const scaleX = (rect.width - padding*2) / contentW
    const scaleY = (rect.height - padding*2) / contentH
    const scale = Math.max(0.3, Math.min(3, Math.min(scaleX, scaleY)))
    const tx = (rect.width - contentW*scale)/2 - minX*scale
    const ty = (rect.height - contentH*scale)/2 - minY*scale
    setTransform({ scale, tx, ty })
  }

  const savePositionsToBuilder = () => {
    const patches = [] as any[]
    for (const n of nodes) {
      const p = nodePos[n.id]
      if (p) {
        const sz = n.size ?? { w: 160, h: 96 }
        patches.push({ id: n.id, x: p.x, y: p.y, w: sz.w, h: sz.h })
      }
    }
    if (patches.length) builderStore.getState().updateMany(patches)
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-gray-600">Arrange prefectures (Smart guides / Resize / Layers)</div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="rounded-md border px-2 py-1 text-sm" onClick={sendToBack}>⤓ 背面へ</button>
          <button className="rounded-md border px-2 py-1 text-sm" onClick={bringToFront}>⤒ 前面へ</button>
          <button className="rounded-md border px-2 py-1 text-sm" onClick={()=> lockToggle(true)}>🔒 ロック</button>
          <button className="rounded-md border px-2 py-1 text-sm" onClick={()=> lockToggle(false)}>🔓 ロック解除</button>
          <button className="rounded-md border px-2 py-1 text-sm" onClick={savePositionsToBuilder}>位置/サイズを保存</button>
          <Link href="/builder" className="rounded-md border px-3 py-1 text-sm">← Builder</Link>
          <Link href="/map" className="rounded-md border px-3 py-1 text-sm">Open /map</Link>
        </div>
      </div>

      <div ref={fitRef}>
        <ZoomPanCanvas onFitRequest={onFit}>
          {/* ガイド線（ワールド内） */}
          <SmartGuides />

          {/* マーキーはスクリーン座標なのでそのまま */}
          <SelectionMarquee nodes={nodes as any[]} />

          {/* ノード */}
          {nodes.map((n: any, i: number) => (
            <DraggableNode
              key={n.id}
              id={n.id}
              label={n.title ?? n.prefecture ?? `node ${i + 1}`}
              initial={n.position ?? { x: (i % 8) * 160, y: Math.floor(i / 8) * 120 }}
              status={n.status}
              size={n.size ?? { w: 160, h: 96 }}
              z={n.z ?? 0}
              locked={!!n.locked}
              onCommit={(xy, sz)=> builderStore.getState().updateMany([{ id: n.id, x: xy.x, y: xy.y, ...(sz ? { w: sz.w, h: sz.h } : {}) }]) }
            />
          ))}
        </ZoomPanCanvas>
      </div>
    </div>
  )
}
