'use client'
import { useRef, useState } from 'react'
import { useCanvasStore } from '@/stores/canvas'
import type { XY } from '@/stores/canvas'
import { buildMotionFromStatus, computeBgColor } from '@/lib/status-engine'
import { runMotionEffects } from '@/lib/runMotion'

export default function DraggableNode({
  id, label, initial, status,
  onCommit,
}: {
  id: string
  label: string
  initial?: XY
  status?: any
  onCommit?: (xy: XY) => void
}) {
  const { nodePos, setNodePos, scale } = useCanvasStore()
  const pos = nodePos[id] ?? initial ?? { x: 0, y: 0 }
  const [drag, setDrag] = useState<XY | null>(null)
  const ref = useRef<HTMLDivElement | null>(null)

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ x: e.clientX, y: e.clientY })
  }
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!drag) return
    const dx = (e.clientX - drag.x) / scale
    const dy = (e.clientY - drag.y) / scale
    setNodePos(id, { x: pos.x + dx, y: pos.y + dy })
  }
  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!drag) return
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
    setDrag(null)
    onCommit?.(useCanvasStore.getState().nodePos[id] ?? pos)
  }

  // ステータス色とホバー演出（任意）
  const bg = computeBgColor(status ?? { base: 'notVisited', overlays: [] })
  const eff = buildMotionFromStatus(id, status ?? { base: 'notVisited', overlays: [] })

  const setRef = (el: HTMLDivElement | null) => {
    ref.current = el
    if (el) queueMicrotask(() => runMotionEffects(eff.mount, 'mount', el))
  }

  return (
    <div
      ref={setRef}
      className="absolute h-24 w-40 select-none rounded-xl border p-3 text-sm shadow-sm"
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)`, backgroundColor: bg, touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onMouseEnter={(e)=> runMotionEffects(eff.hoverEnter, 'hoverEnter', e.currentTarget as HTMLElement)}
      onMouseLeave={(e)=> runMotionEffects(eff.hoverLeave, 'hoverLeave', e.currentTarget as HTMLElement)}
      data-node-id={id}
    >
      {label}
      <div className="mt-1 text-[10px] text-gray-700/80">drag to move</div>
    </div>
  )
}
