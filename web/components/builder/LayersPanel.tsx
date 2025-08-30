'use client'
import React from 'react'
import {
  DndContext,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useBuilderStore } from '@/store/builderStore'

function LayerItem({ id }: { id: string }) {
  const el = useBuilderStore((s) => s.elements.find((e) => e.id === id))
  const selected = useBuilderStore((s) => s.selectedIds.includes(id))
  const select = useBuilderStore((s) => s.select)
  const setVisible = useBuilderStore((s) => s.setVisible)
  const setLocked = useBuilderStore((s) => s.setLocked)
  const updateProps = useBuilderStore((s) => s.updateProps)
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  if (!el) return null
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  const [name, setName] = React.useState(el.props?.name || '')
  React.useEffect(() => {
    setName(el.props?.name || '')
  }, [el.props?.name])
  const commitName = () => updateProps(el.id, { name })
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => select(id)}
      className={`flex items-center gap-1 px-1 text-xs border-b border-zinc-800 ${selected ? 'bg-zinc-800' : ''}`}
    >
      <button onClick={() => setVisible(el.id, el.visible === false)} className="w-4 text-zinc-400">
        {el.visible === false ? '🙈' : '👁'}
      </button>
      <button onClick={() => setLocked(el.id, !(el.locked))} className="w-4 text-zinc-400">
        {el.locked ? '🔒' : '🔓'}
      </button>
      <input
        className="flex-1 bg-transparent outline-none"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={commitName}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commitName()
            ;(e.target as HTMLInputElement).blur()
          }
        }}
      />
    </div>
  )
}

export default function LayersPanel() {
  const els = useBuilderStore((s) => s.elements)
  const ids = React.useMemo(() => [...els].map((e) => e.id).reverse(), [els])
  const reorder = useBuilderStore((s) => s.reorder)
  const selectedIds = useBuilderStore((s) => s.selectedIds)
  const groupSel = useBuilderStore((s) => s.group)
  const ungroupSel = useBuilderStore((s) => s.ungroup)
  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (over && active.id !== over.id) {
      const oldIndex = ids.indexOf(active.id as string)
      const newIndex = ids.indexOf(over.id as string)
      const newOrder = arrayMove(ids, oldIndex, newIndex).reverse()
      reorder(newOrder)
    }
  }
  const canUngroup = React.useMemo(() => {
    if (selectedIds.length !== 1) return false
    const el = els.find((e) => e.id === selectedIds[0])
    return Boolean(el?.children && el.children.length)
  }, [selectedIds, els])
  return (
    <div>
      <div className="flex gap-1 mb-1 text-xs">
        <button
          className="px-1 border border-zinc-700 rounded disabled:opacity-40"
          disabled={selectedIds.length < 2}
          onClick={() => groupSel(selectedIds)}
        >
          Group
        </button>
        <button
          className="px-1 border border-zinc-700 rounded disabled:opacity-40"
          disabled={!canUngroup}
          onClick={() => ungroupSel(selectedIds[0])}
        >
          Ungroup
        </button>
      </div>
      <DndContext onDragEnd={handleDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="text-xs border border-zinc-800">
            {ids.map((id) => (
              <LayerItem key={id} id={id} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

