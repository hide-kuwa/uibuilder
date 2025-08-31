'use client'
import React from 'react'
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PagesPanel } from './PagesPanel'
import { Palette } from './Palette'
import { LayersContent, LayersControls } from './LayersPanel'
import { usePageStore } from '@/store/pageStore'

type PanelId = 'layers' | 'pages' | 'palette'

function AddPageButton() {
  const addPage = usePageStore((s) => s.addPage)
  return (
    <button
      className="px-1 text-xs border border-zinc-700 rounded"
      onClick={() => addPage()}
    >
      +
    </button>
  )
}

function SortablePanel({
  id,
  title,
  collapsed,
  onToggle,
  children,
  extraHeader,
}: {
  id: PanelId
  title: string
  collapsed: boolean
  onToggle: () => void
  children: React.ReactNode
  extraHeader?: React.ReactNode
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div ref={setNodeRef} style={style} className="border border-zinc-800 rounded">
      <div
        className="flex items-center justify-between bg-zinc-900 px-2 py-1 cursor-grab select-none"
        {...attributes}
        {...listeners}
      >
        <span className="text-sm font-semibold">{title}</span>
        <div className="flex items-center gap-2">
          {extraHeader}
          <button
            className="px-1 text-xs border border-zinc-700 rounded"
            onClick={onToggle}
          >
            {collapsed ? '+' : '−'}
          </button>
        </div>
      </div>
      {!collapsed && <div className="p-2">{children}</div>}
    </div>
  )
}

export default function LeftSidebar() {
  const panels: Record<PanelId, { title: string; render: () => React.ReactNode; extra?: React.ReactNode }> = {
    layers: { title: 'Layers', render: () => <LayersContent />, extra: <LayersControls /> },
    pages: {
      title: 'Pages',
      render: () => <PagesPanel showHeader={false} />,
      extra: <AddPageButton />,
    },
    palette: { title: 'パレット', render: () => <Palette /> },
  }
  const [order, setOrder] = React.useState<PanelId[]>([
    'layers',
    'pages',
    'palette',
  ])
  const [collapsed, setCollapsed] = React.useState<Record<PanelId, boolean>>({
    layers: false,
    pages: false,
    palette: false,
  })
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (!over || active.id === over.id) return
    const oldIndex = order.indexOf(active.id as PanelId)
    const newIndex = order.indexOf(over.id as PanelId)
    setOrder(arrayMove(order, oldIndex, newIndex))
  }

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950/40 p-2 flex flex-col gap-2">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          {order.map((id) => (
            <SortablePanel
              key={id}
              id={id}
              title={panels[id].title}
              collapsed={collapsed[id]}
              onToggle={() =>
                setCollapsed((c) => ({ ...c, [id]: !c[id] }))
              }
              extraHeader={panels[id].extra}
            >
              {panels[id].render()}
            </SortablePanel>
          ))}
        </SortableContext>
      </DndContext>
    </aside>
  )
}

