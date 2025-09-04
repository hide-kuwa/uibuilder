'use client'
import { useRef, useState, useEffect } from 'react'
import { useCanvasStore } from '@/stores/canvas'
import type { XY } from '@/stores/canvas'
import { snapToGrid } from '@/lib/snap'
import { buildMotionFromStatus, computeBgColor } from '@/lib/status-engine'
import { runMotionEffects } from '@/lib/runMotion'

export default function DraggableNode({
  id, label, initial, status, size = { w: 160, h: 96 }, onCommit,
}: {
  id: string
  label: string
  initial?: XY
  status?: any
  size?: { w: number; h: number }
  onCommit?: (xy: XY) => void
}) {
  const {
    nodePos,
    setNodePos,
    moveNodes,
    scale,
    selectedIds,
    toggleSelect,
    setSelectedIds,
    snapEnabled,
    gridSize,
    snapThreshold,
    setInitialPos,
  } = useCanvasStore()
  const pos = nodePos[id] ?? initial ?? { x: 0, y: 0 }
  const selected = selectedIds.includes(id)
  const [dragStart, setDragStart] = useState<{ x: number; y: number; base: XY } | null>(null)

  useEffect(() => {
    if (initial) setInitialPos(id, initial)
  }, [id, initial, setInitialPos])

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const multi = e.metaKey || e.ctrlKey
    const alreadySelected = selectedIds.includes(id)

    if (multi) {
      toggleSelect(id, true)
    } else {
      if (!alreadySelected) {
        setSelectedIds([id])
      }
    }

    setDragStart({ x: e.clientX, y: e.clientY, base: pos })
  }

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragStart) return
    const dx = (e.clientX - dragStart.x) / scale
    const dy = (e.clientY - dragStart.y) / scale

    // 単体ドラッグ → グリッドスナップ
    if (selectedIds.length <= 1) {
      const raw = { x: dragStart.base.x + dx, y: dragStart.base.y + dy }
      const next = snapEnabled ? snapToGrid(raw, gridSize, snapThreshold) : raw
      setNodePos(id, next)
    } else {
      // 複数選択 → 相対移動（スナップは最後の確定時に委ねる）
      moveNodes(selectedIds, dx, dy)
      setDragStart({ ...dragStart, x: e.clientX, y: e.clientY })
    }
  }

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!dragStart) return
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
    setDragStart(null)

    // 複数移動の最終スナップ（代表だけスナップ→相対差分を全体適用）
    if (selectedIds.length > 1) {
      const rep = useCanvasStore.getState().nodePos[id] ?? pos
      const snapped = snapEnabled ? snapToGrid(rep, gridSize, snapThreshold) : rep
      const ddx = snapped.x - rep.x
      const ddy = snapped.y - rep.y
      if (ddx || ddy) useCanvasStore.getState().moveNodes(selectedIds, ddx, ddy)
      // Commit は代表のみ呼ぶ（任意）
      onCommit?.(snapped)
    } else {
      const cur = useCanvasStore.getState().nodePos[id] ?? pos
      onCommit?.(cur)
    }
  }

  const bg = computeBgColor(status ?? { base: 'notVisited', overlays: [] })
  const eff = buildMotionFromStatus(id, status ?? { base: 'notVisited', overlays: [] })

  return (
    <div
      className={`absolute select-none rounded-xl border p-3 text-sm shadow-sm ${selected ? 'ring-2 ring-indigo-400' : ''}`}
      style={{ width: size.w, height: size.h, transform: `translate(${pos.x}px, ${pos.y}px)`, backgroundColor: bg, touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseEnter={(e)=> runMotionEffects(eff.hoverEnter, 'hoverEnter', e.currentTarget as HTMLElement)}
      onMouseLeave={(e)=> runMotionEffects(eff.hoverLeave, 'hoverLeave', e.currentTarget as HTMLElement)}
      ref={(el)=>{ if (el) queueMicrotask(()=> el && runMotionEffects(eff.mount, 'mount', el)) }}
      data-node-id={id}
    >
      {label}
      <div className="mt-1 text-[10px] text-gray-700/80">{selected ? 'multi-drag: OK / ⌘(Ctrl)+Click: toggle' : 'drag to move'}</div>
    </div>
  )
}
