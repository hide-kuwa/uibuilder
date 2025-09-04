'use client'
import ZoomPanCanvas from '@/components/canvas/ZoomPanCanvas'
import DraggableNode from '@/components/canvas/DraggableNode'
import SelectionMarquee from '@/components/canvas/SelectionMarquee'
import SmartGuides from '@/components/canvas/SmartGuides'
import { useCanvasStore } from '@/stores/canvas'
import { useBuilderStore, builderStore } from '@/stores/builder'
import { useHistoryStore } from '@/stores/history'
import Link from 'next/link'
import { useRef, useEffect } from 'react'

export default function ArrangePage() {
  const nodes = useBuilderStore(s => Object.values(s.nodes ?? {}))
  const selectedIds = useCanvasStore(s => s.selectedIds)
  const { nodePos, createGroup, ungroup, memberOf, groups, groupSelectEnabled, setGroupSelectEnabled } = useCanvasStore()
  const setTransform = useCanvasStore(s => s.setTransform)
  const { canUndo, canRedo, undo, redo, record } = useHistoryStore()

  // 矢印キーは前ステップのまま…

  // レイヤー操作
  const bringToFront = () => {
    if (!selectedIds.length) return
    record()
    const maxZ = Math.max(0, ...nodes.map(n => n.z ?? 0))
    for (const id of selectedIds) {
      builderStore.getState().updateNode(id, (prev:any)=> ({ ...prev, z: maxZ + 1 }))
    }
  }
  const sendToBack = () => {
    if (!selectedIds.length) return
    record()
    const minZ = Math.min(0, ...nodes.map(n => n.z ?? 0))
    for (const id of selectedIds) {
      builderStore.getState().updateNode(id, (prev:any)=> ({ ...prev, z: minZ - 1 }))
    }
  }
  const lockToggle = (lock: boolean) => {
    if (!selectedIds.length) return
    record()
    for (const id of selectedIds) {
      builderStore.getState().updateNode(id, (prev:any)=> ({ ...prev, locked: lock }))
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
    record()
    setTransform({ scale, tx, ty })
  }

  const savePositionsToBuilder = () => {
    for (const n of nodes) {
      const p = nodePos[n.id]
      if (p) builderStore.getState().updateNode(n.id, (prev: any) => ({
        ...prev,
        position: p,
        size: prev.size ?? { w: 160, h: 96 }, // 既存に無ければ初期値
      }))
    }
  }

  // キーボード: Undo/Redo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z / Shift+Z / Y
      const mod = e.metaKey || e.ctrlKey
      if (!mod) return
      if (e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if (e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  return (
    <div className="space-y-3 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-gray-600">Arrange prefectures (Smart guides / Resize / Layers)</div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="rounded-md border px-2 py-1 text-sm" onClick={()=> undo()} disabled={!canUndo}>↶ Undo</button>
          <button className="rounded-md border px-2 py-1 text-sm" onClick={()=> redo()} disabled={!canRedo}>↷ Redo</button>

          <div className="mx-2 h-5 w-px bg-gray-300" />

          <button
            className="rounded-md border px-2 py-1 text-sm"
            onClick={() => { if (selectedIds.length >= 2) createGroup(selectedIds) }}
            disabled={selectedIds.length < 2}
          >
            Group
          </button>

          <button
            className="rounded-md border px-2 py-1 text-sm"
            onClick={() => {
              const gid = memberOf[selectedIds[0] ?? '']
              if (gid) ungroup(gid)
            }}
            disabled={!memberOf[selectedIds[0] ?? '']}
          >
            Ungroup
          </button>

          <label className="ml-2 inline-flex items-center gap-2 text-xs text-gray-600">
            <input type="checkbox" checked={groupSelectEnabled} onChange={(e)=> setGroupSelectEnabled(e.target.checked)} />
            Group click-select
          </label>

          <div className="mx-2 h-5 w-px bg-gray-300" />

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
              onCommit={(xy, sz)=> builderStore.getState().updateNode(n.id, (prev:any)=> ({ ...prev, position: xy, size: sz ?? prev.size })) }
            />
          ))}
        </ZoomPanCanvas>
      </div>
    </div>
  )
}
