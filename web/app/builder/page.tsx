'use client'
import React from 'react'
import { DndContext, useSensor, useSensors, PointerSensor, DragEndEvent } from '@dnd-kit/core'
import { Palette } from '@/components/builder/Palette'
import { Canvas } from '@/components/builder/Canvas'
import { Inspector } from '@/components/builder/Inspector'
import { useBuilderStore } from '@/store/builderStore'

export default function BuilderPage() {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))
  const canvasRef = React.useRef<HTMLDivElement>(null)
  const addFromPalette = useBuilderStore((s) => s.addFromPalette)
  const moveExisting = useBuilderStore((s) => s.move)

  const onDragEnd = React.useCallback(
    (e: DragEndEvent) => {
      const data: any = e.active?.data?.current
      if (!data) return
      const overId = e.over?.id
      if (overId !== 'CANVAS') return

      const evt = (e.activatorEvent || e.activator || {}) as any
      const clientX =
        evt?.clientX ??
        (evt?.touches && evt.touches[0]?.clientX) ??
        (evt?.changedTouches && evt.changedTouches[0]?.clientX)
      const clientY =
        evt?.clientY ??
        (evt?.touches && evt.touches[0]?.clientY) ??
        (evt?.changedTouches && evt.changedTouches[0]?.clientY)
      const rect = canvasRef.current?.getBoundingClientRect()
      const x = rect ? clientX - rect.left : 40
      const y = rect ? clientY - rect.top : 40

      if (data.from === 'palette') {
        addFromPalette(data.type as any, { x, y })
      } else if (data.from === 'canvas' && typeof data.id === 'string') {
        // existing element drag end (dnd-kit coordinates are delta-based, so Canvas handles move())
        moveExisting(data.id, { x: x - (data.anchorX ?? 0), y: y - (data.anchorY ?? 0) })
      }
    },
    [addFromPalette, moveExisting],
  )

  return (
    <div className="flex h-[calc(100vh-40px)]">
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <aside className="w-64 border-r border-zinc-800 bg-zinc-950/40 p-3">
          <h2 className="text-sm font-semibold mb-2">パレット</h2>
          <Palette />
        </aside>
        <main className="flex-1 relative">
          <Canvas canvasRef={canvasRef} />
        </main>
        <aside className="w-72 border-l border-zinc-800 bg-zinc-950/40 p-3">
          <h2 className="text-sm font-semibold mb-2">プロパティ</h2>
          <Inspector />
        </aside>
      </DndContext>
    </div>
  )
}

