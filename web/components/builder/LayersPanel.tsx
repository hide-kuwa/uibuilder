'use client'
import * as React from 'react'
import { useBuilderStore } from '@/store/builderStore'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function Row({ id, depth = 0 }: { id: string; depth?: number }) {
  const el = useBuilderStore((s) => s.elements.find((e) => e.id === id))
  const select = useBuilderStore((s) => s.select)
  const setVisible = useBuilderStore((s) => s.setVisible)
  const setLocked = useBuilderStore((s) => s.setLocked)
  const rename = useBuilderStore((s) => s.rename)
  const selectedIds = useBuilderStore((s) => s.selectedIds)
  const childIds = useBuilderStore(
    (s) => s.elements.filter((e) => e.parentId === id).map((e) => e.id),
  )
  const isSelected = selectedIds.includes(id)
  const [editing, setEditing] = React.useState(false)
  const [expanded, setExpanded] = React.useState(true)
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, data: { parentId: el?.parentId ?? null } })

  if (!el) return null
  const isGroup = el.type === 'group'
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-2 h-7 px-2 text-sm ${
          isSelected ? 'bg-zinc-700' : 'hover:bg-zinc-800'
        }`}
        onClick={() => select(id)}
      >
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab opacity-70"
          style={{ marginLeft: depth * 8 }}
        >
          ≡
        </span>
        {isGroup && childIds.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded((v) => !v)
            }}
            className="w-4"
          >
            {expanded ? '▾' : '▸'}
          </button>
        )}
        {!isGroup && <span className="w-4" />}
        <button
          onClick={(e) => {
            e.stopPropagation()
            setVisible(id, !(el.visible ?? true))
          }}
          title="Toggle visible"
        >
          {el.visible === false ? '🚫' : '👁'}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setLocked(id, !(el.locked ?? false))
          }}
          title="Toggle lock"
        >
          {el.locked ? '🔒' : '🔓'}
        </button>
        {editing ? (
          <input
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-1"
            autoFocus
            defaultValue={el.name || el.type}
            onBlur={(e) => {
              rename(id, e.currentTarget.value)
              setEditing(false)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                rename(id, (e.target as HTMLInputElement).value)
                setEditing(false)
              }
              if (e.key === 'Escape') setEditing(false)
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div
            className="flex-1 truncate"
            onDoubleClick={(e) => {
              e.stopPropagation()
              setEditing(true)
            }}
          >
            {el.name || el.type}
            {isGroup ? ' (group)' : ''}
          </div>
        )}
      </div>
      {isGroup && expanded && childIds.length > 0 && (
        <div className="pl-4">
          <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
            {childIds.map((cid) => (
              <Row key={cid} id={cid} depth={depth + 1} />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  )
}

export default function LayersPanel() {
  const elements = useBuilderStore((s) => s.elements)
  const rootIds = elements.filter((e) => !e.parentId).map((e) => e.id)
  const reorderWithinParent = useBuilderStore((s) => s.reorderWithinParent)
  const selectedIds = useBuilderStore((s) => s.selectedIds)
  const group = useBuilderStore((s) => s.group)
  const ungroup = useBuilderStore((s) => s.ungroup)

  const canGroup = React.useMemo(() => {
    if (selectedIds.length < 2) return false
    const first = elements.find((e) => e.id === selectedIds[0])
    const parent = first?.parentId ?? null
    return selectedIds.every(
      (sid) => (elements.find((e) => e.id === sid)?.parentId ?? null) === parent,
    )
  }, [selectedIds, elements])

  const canUngroup =
    selectedIds.length === 1 &&
    elements.find((e) => e.id === selectedIds[0])?.type === 'group'

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const activeParent = (active.data.current as any)?.parentId ?? null
    const overParent = (over.data.current as any)?.parentId ?? null
    if (activeParent !== overParent) return
    const siblings = elements
      .filter((el) => (el.parentId ?? null) === activeParent)
      .map((el) => el.id)
    const oldIndex = siblings.indexOf(active.id as string)
    const newIndex = siblings.indexOf(over.id as string)
    const newOrder = arrayMove(siblings, oldIndex, newIndex)
    reorderWithinParent(activeParent, newOrder)
  }

  return (
    <aside
      className="w-64 border-r border-zinc-800 bg-zinc-950/40 h-full flex flex-col"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Delete' || e.key === 'Backspace') && canUngroup) {
          ungroup(selectedIds[0])
        }
      }}
    >
      <div className="px-2 py-2 border-b border-zinc-800 flex items-center gap-2">
        <div className="font-medium text-sm">Layers</div>
        <div className="ml-auto flex gap-2">
          <button
            className="px-2 py-1 bg-zinc-800 rounded disabled:opacity-50"
            disabled={!canGroup}
            onClick={() => group(selectedIds, { name: 'Group' })}
          >
            Group
          </button>
          <button
            className="px-2 py-1 bg-zinc-800 rounded disabled:opacity-50"
            disabled={!canUngroup}
            onClick={() => ungroup(selectedIds[0])}
          >
            Ungroup
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <DndContext onDragEnd={onDragEnd}>
          <SortableContext items={rootIds} strategy={verticalListSortingStrategy}>
            {rootIds.map((id) => (
              <Row key={id} id={id} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </aside>
  )
}

