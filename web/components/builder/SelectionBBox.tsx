'use client'
import React from 'react'
import { useBuilderStore } from '@/store/builderStore'
import { snapRect, collectSnapPoints } from '@/lib/builder/snap'
import { useViewStore } from '@/store/viewStore'
import { screenToWorld } from '@/lib/coord'

export function SelectionBBox() {
  const selectedIds = useBuilderStore((s) => s.selectedIds)
  const elements = useBuilderStore((s) => s.elements)
  const updateMany = useBuilderStore((s) => s.updateMany)
  const clearGuides = useBuilderStore((s) => s.clearGuides)
  const worldToScreen = useViewStore((s) => s.worldToScreen)
  const zoom = useViewStore((s) => s.zoom)
  if (selectedIds.length < 2) return null
  const selected = elements.filter((el) => selectedIds.includes(el.id) && el.visible !== false)
  const x1 = Math.min(...selected.map((e) => e.x))
  const y1 = Math.min(...selected.map((e) => e.y))
  const x2 = Math.max(...selected.map((e) => e.x + e.w))
  const y2 = Math.max(...selected.map((e) => e.y + e.h))
  const bbox = { x: x1, y: y1, w: x2 - x1, h: y2 - y1 }

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const root = (e.currentTarget as HTMLElement).closest('[data-canvas-root]') as HTMLElement
    const rect = root.getBoundingClientRect()
    const start = screenToWorld(e.clientX - rect.left, e.clientY - rect.top)
    const startBox = { ...bbox }
    const snapPoints = collectSnapPoints(elements, undefined)
    const move = (ev: PointerEvent) => {
      const p = screenToWorld(ev.clientX - rect.left, ev.clientY - rect.top)
      const dx = p.x - start.x
      const dy = p.y - start.y
      const { rect: r } = snapRect(
        { x: startBox.x + dx, y: startBox.y + dy, w: startBox.w, h: startBox.h },
        snapPoints,
        { mode: 'move' },
      )
      const patches = selected.map((el) => ({ id: el.id, patch: { x: el.x + r.x - bbox.x, y: el.y + r.y - bbox.y } }))
      updateMany(patches)
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      clearGuides()
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div
      className="absolute border border-sky-400/80"
      style={{
        left: worldToScreen({ x: bbox.x, y: bbox.y }).x,
        top: worldToScreen({ x: bbox.x, y: bbox.y }).y,
        width: bbox.w * zoom,
        height: bbox.h * zoom,
      }}
      onPointerDown={onPointerDown}
    />
  )
}

export default SelectionBBox
