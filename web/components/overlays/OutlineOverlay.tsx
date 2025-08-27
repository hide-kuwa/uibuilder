'use client'
import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useEditorUIStore } from '@/store/editorUIStore'
import { useEditorStore } from '@/store/editorStore'

type Box = { id: string; x: number; y: number; w: number; h: number; label?: string }

function collectBoxes(container: HTMLElement): Box[] {
  const els = container.querySelectorAll<HTMLElement>('[data-node-id]')
  const boxes: Box[] = []
  els.forEach((el) => {
    const id = el.dataset.nodeId!
    const r = el.getBoundingClientRect()
    const cr = container.getBoundingClientRect()
    boxes.push({
      id,
      x: r.left - cr.left,
      y: r.top - cr.top,
      w: r.width,
      h: r.height,
      label: el.dataset.nodeName || el.dataset.nodeType || id,
    })
  })
  return boxes
}

export function OutlineOverlay({
  canvasRef,
}: {
  /** キャンバスのスクロール・ズーム対象のルート（DOM） */
  canvasRef: React.RefObject<HTMLElement>
}) {
  const { showOutline, outlineMode } = useEditorUIStore()
  const { selectedIds, hoverId } = useEditorStore((s) => ({
    selectedIds: (s as any).selectedIds as string[] | undefined,
    hoverId: (s as any).hoverId as string | undefined,
  }))
  const [boxes, setBoxes] = useState<Box[]>([])
  const rafRef = useRef<number | null>(null)

  useLayoutEffect(() => {
    if (!canvasRef.current) return
    const root = canvasRef.current

    const pump = () => {
      setBoxes(collectBoxes(root))
      rafRef.current = requestAnimationFrame(pump)
    }
    pump()

    const ro = new ResizeObserver(() => setBoxes(collectBoxes(root)))
    ro.observe(root)

    const mo = new MutationObserver(() => setBoxes(collectBoxes(root)))
    mo.observe(root, { attributes: true, childList: true, subtree: true })

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      mo.disconnect()
    }
  }, [canvasRef])

  const filtered = useMemo(() => {
    if (!showOutline) return []
    if (outlineMode === 'all') return boxes
    if (outlineMode === 'hover') {
      return hoverId ? boxes.filter((b) => b.id === hoverId) : []
    }
    const set = new Set(selectedIds ?? [])
    return boxes.filter((b) => set.has(b.id))
  }, [showOutline, outlineMode, boxes, selectedIds, hoverId])

  if (!canvasRef.current) return null

  return createPortal(
    <div className="pointer-events-none absolute inset-0">
      {filtered.map((b) => {
        const isSelected = selectedIds?.includes(b.id)
        const isHover = hoverId === b.id
        const color = isSelected
          ? 'rgb(59 130 246)'
          : isHover
            ? 'rgb(20 184 166)'
            : 'rgb(148 163 184)'
        return (
          <div
            key={b.id}
            className="absolute"
            style={{
              left: b.x,
              top: b.y,
              width: b.w,
              height: b.h,
              outline: `1px dashed ${color}`,
              outlineOffset: 0,
              boxShadow: `inset 0 0 0 1px ${color}`,
            }}
          >
            <div
              className="absolute -top-5 left-0 px-1.5 py-[2px] text-[10px] leading-none rounded bg-black/70 text-white"
              style={{ border: `1px solid ${color}` }}
            >
              {b.label} · {Math.round(b.w)}×{Math.round(b.h)}
            </div>
          </div>
        )
      })}
    </div>,
    canvasRef.current
  )
}
