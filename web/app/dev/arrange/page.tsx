'use client'
import ZoomPanCanvas from '@/components/canvas/ZoomPanCanvas'
import DraggableNode from '@/components/canvas/DraggableNode'
import SelectionMarquee from '@/components/canvas/SelectionMarquee'
import { useCanvasStore } from '@/stores/canvas'
import { useBuilderStore } from '@/store/builderStore' // adjust to existing path
import Link from 'next/link'
import { useEffect, useRef } from 'react'

const builderStore = useBuilderStore as any

export default function ArrangePage() {
  const nodes = useBuilderStore(s => Object.values((s as any).nodes ?? {}))
  const selectedIds = useCanvasStore(s => s.selectedIds)
  const { nodePos, setNodePos, moveNodes, snapEnabled, gridSize, snapThreshold } = useCanvasStore()
  const setSelectedIds = useCanvasStore(s => s.setSelectedIds)
  const setTransform = useCanvasStore(s => s.setTransform)

  // キーボード微調整
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedIds.length) return
      const step = e.shiftKey ? 10 : 1
      if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)) e.preventDefault()
      if (e.key === 'ArrowLeft') moveNodes(selectedIds, -step, 0)
      if (e.key === 'ArrowRight') moveNodes(selectedIds, step, 0)
      if (e.key === 'ArrowUp') moveNodes(selectedIds, 0, -step)
      if (e.key === 'ArrowDown') moveNodes(selectedIds, 0, step)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedIds])

  // 整列・等間隔
  const align = (dir: 'left'|'right'|'top'|'bottom'|'hcenter'|'vcenter') => {
    const sels = nodes.filter((n: any) => selectedIds.includes(n.id))
    if (sels.length < 2) return
    const pos = (id: string) => nodePos[id] ?? { x: 0, y: 0 }
    const size = { w: 160, h: 96 }

    const xs = sels.map((n: any) => pos(n.id).x)
    const ys = sels.map((n: any) => pos(n.id).y)

    const minX = Math.min(...xs), maxX = Math.max(...xs)
    const minY = Math.min(...ys), maxY = Math.max(...ys)

    sels.forEach((n: any) => {
      const p = pos(n.id)
      if (dir === 'left') setNodePos(n.id, { x: minX, y: p.y })
      if (dir === 'right') setNodePos(n.id, { x: maxX, y: p.y })
      if (dir === 'top') setNodePos(n.id, { x: p.x, y: minY })
      if (dir === 'bottom') setNodePos(n.id, { x: p.x, y: maxY })
      if (dir === 'hcenter') setNodePos(n.id, { x: (minX + maxX)/2, y: p.y })
      if (dir === 'vcenter') setNodePos(n.id, { x: p.x, y: (minY + maxY)/2 })
    })
  }

  const distribute = (axis: 'h'|'v') => {
    const sels = nodes.filter((n: any) => selectedIds.includes(n.id))
    if (sels.length < 3) return
    const pos = (id: string) => nodePos[id] ?? { x: 0, y: 0 }
    const sorted = [...sels].sort((a: any,b: any)=> axis==='h' ? pos(a.id).x - pos(b.id).x : pos(a.id).y - pos(b.id).y)
    const coords = sorted.map((n: any) => axis==='h' ? pos(n.id).x : pos(n.id).y)
    const min = coords[0], max = coords[coords.length-1]
    const step = (max - min) / (coords.length - 1)
    sorted.forEach((n: any, i: number) => {
      const p = pos(n.id)
      if (axis==='h') setNodePos(n.id, { x: Math.round(min + step*i), y: p.y })
      else setNodePos(n.id, { x: p.x, y: Math.round(min + step*i) })
    })
  }

  // Fit-to-Content：全ノードの外接矩形をビューポートにフィット
  const fitRef = useRef<HTMLDivElement | null>(null)
  const onFit = () => {
    const el = fitRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const padding = 40
    const positions = nodes.map((n: any) => nodePos[n.id] ?? n.position ?? { x: 0, y: 0 })
    if (!positions.length) return
    const xs = positions.map((p: any) => p.x)
    const ys = positions.map((p: any) => p.y)
    const minX = Math.min(...xs), maxX = Math.max(...xs)
    const minY = Math.min(...ys), maxY = Math.max(...ys)
    const contentW = (maxX - minX) + 160 /*仮の幅*/
    const contentH = (maxY - minY) + 96  /*仮の高*/
    const scaleX = (rect.width - padding*2) / contentW
    const scaleY = (rect.height - padding*2) / contentH
    const scale = Math.max(0.3, Math.min(3, Math.min(scaleX, scaleY)))
    const tx = (rect.width - contentW*scale)/2 - minX*scale
    const ty = (rect.height - contentH*scale)/2 - minY*scale
    setTransform({ scale, tx, ty })
  }

  // Builder に位置を反映
  const savePositionsToBuilder = () => {
    for (const n of nodes as any[]) {
      const p = nodePos[n.id]
      if (p) builderStore.getState().updateNode?.(n.id, (prev: any) => ({ ...prev, position: p }))
    }
  }

  return (
    <div className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-gray-600">Arrange prefectures (Zoom / Pan / Drag / Select)</div>
        <div className="flex flex-wrap items-center gap-2">
          {/* 整列 */}
          <div className="flex items-center gap-1">
            <button className="rounded-md border px-2 py-1 text-sm" onClick={()=>align('left')}>⟸ 左揃え</button>
            <button className="rounded-md border px-2 py-1 text-sm" onClick={()=>align('hcenter')}>┼ 中央(横)</button>
            <button className="rounded-md border px-2 py-1 text-sm" onClick={()=>align('right')}>右揃え ⟹</button>
          </div>
          <div className="flex items-center gap-1">
            <button className="rounded-md border px-2 py-1 text-sm" onClick={()=>align('top')}>⟰ 上揃え</button>
            <button className="rounded-md border px-2 py-1 text-sm" onClick={()=>align('vcenter')}>┼ 中央(縦)</button>
            <button className="rounded-md border px-2 py-1 text-sm" onClick={()=>align('bottom')}>下揃え ⟱</button>
          </div>
          {/* 等間隔 */}
          <div className="flex items-center gap-1">
            <button className="rounded-md border px-2 py-1 text-sm" onClick={()=>distribute('h')}>等間隔(横)</button>
            <button className="rounded-md border px-2 py-1 text-sm" onClick={()=>distribute('v')}>等間隔(縦)</button>
          </div>
          {/* スナップ */}
          <label className="ml-2 inline-flex items-center gap-2 text-xs text-gray-600">
            <input
              type="checkbox"
              checked={snapEnabled}
              onChange={(e)=> useCanvasStore.setState({ snapEnabled: e.target.checked })}
            />
            Grid Snap
          </label>

          <button className="rounded-md border px-2 py-1 text-sm" onClick={savePositionsToBuilder}>位置を保存</button>
          <Link href="/builder" className="rounded-md border px-3 py-1 text-sm">← Builder</Link>
          <Link href="/map" className="rounded-md border px-3 py-1 text-sm">Open /map</Link>
        </div>
      </div>

      <div ref={fitRef}>
        <ZoomPanCanvas onFitRequest={onFit}>
          {/* 背景マーキー（範囲選択） */}
          <SelectionMarquee nodes={nodes as any[]} />

          {/* ノード群 */}
          {nodes.map((n: any, i: number) => (
            <DraggableNode
              key={n.id}
              id={n.id}
              label={n.title ?? n.prefecture ?? `node ${i + 1}`}
              initial={n.position ?? { x: (i % 8) * 160, y: Math.floor(i / 8) * 120 }}
              status={n.status}
              onCommit={(xy)=> builderStore.getState().updateNode?.(n.id, (prev: any) => ({ ...prev, position: xy })) }
            />
          ))}
        </ZoomPanCanvas>
      </div>
    </div>
  )
}
