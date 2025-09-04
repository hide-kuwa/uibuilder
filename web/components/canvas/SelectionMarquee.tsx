'use client'
import { useRef, useState } from 'react'
import { useCanvasStore } from '@/stores/canvas'

type NodeBox = { id: string; x: number; y: number; w: number; h: number }

export default function SelectionMarquee({
  nodes, size = { w: 160, h: 96 },
}: {
  nodes: Array<{ id: string; position?: { x: number; y: number } }>
  size?: { w: number; h: number }
}) {
  const { scale, tx, ty, nodePos, setSelectedIds, clearSelection } = useCanvasStore()
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null)
  const start = useRef<{ sx: number; sy: number } | null>(null)

  const screenToWorld = (sx: number, sy: number) => ({ x: (sx - tx) / scale, y: (sy - ty) / scale })

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    // 背景でドラッグ開始（子要素のドラッグは DraggableNode 側が処理）
    if (e.currentTarget !== e.target) return
    e.currentTarget.setPointerCapture(e.pointerId)
    start.current = { sx: e.clientX, sy: e.clientY }
    setRect({ x: e.clientX, y: e.clientY, w: 0, h: 0 })
    clearSelection()
  }
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!start.current) return
    const w = e.clientX - start.current.sx
    const h = e.clientY - start.current.sy
    setRect({ x: Math.min(start.current.sx, e.clientX), y: Math.min(start.current.sy, e.clientY), w: Math.abs(w), h: Math.abs(h) })

    // ヒットテスト
    const r1 = { x: rect?.x ?? start.current.sx, y: rect?.y ?? start.current.sy, w: rect?.w ?? 0, h: rect?.h ?? 0 }
    const worldMin = screenToWorld(r1.x, r1.y)
    const worldMax = screenToWorld(r1.x + r1.w, r1.y + r1.h)
    const sel: string[] = []
    for (const n of nodes) {
      const p = (nodePos[n.id] ?? n.position ?? { x: 0, y: 0 })
      const nb = { x: p.x, y: p.y, w: size.w, h: size.h }
      const hit = nb.x < worldMax.x && nb.x + nb.w > worldMin.x && nb.y < worldMax.y && nb.y + nb.h > worldMin.y
      if (hit) sel.push(n.id)
    }
    setSelectedIds(sel)
  }
  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!start.current) return
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
    start.current = null
    setRect(null)
  }

  return (
    <div className="absolute inset-0" onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp}>
      {rect && (
        <div
          className="pointer-events-none absolute rounded border border-indigo-400/70 bg-indigo-400/10"
          style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
        />
      )}
    </div>
  )
}
