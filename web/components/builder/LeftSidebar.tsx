'use client'
import React from 'react'
import { useDndMonitor } from '@dnd-kit/core'
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
import DataSourcesPanel from '@/components/data/DataSourcesPanel'
import UIAuditPanel from '@/components/panel/UIAuditPanel'

type PanelId = 'layers' | 'pages' | 'palette' | 'data' | 'audit'

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
  className,
  contentClassName,
}: {
  id: PanelId
  title: string
  collapsed: boolean
  onToggle: () => void
  children: React.ReactNode
  extraHeader?: React.ReactNode
  className?: string
  contentClassName?: string
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id })
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`border border-zinc-800 rounded flex flex-col ${className || ''}`}
    >
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
      {!collapsed && (
        <div className={`p-2 ${contentClassName || ''}`}>{children}</div>
      )}
    </div>
  )
}

export default function LeftSidebar() {
  const panels: Record<
    PanelId,
    { title: string; render: () => React.ReactNode; extra?: React.ReactNode }
  > = {
    layers: {
      title: 'Layers',
      render: () => <LayersContent />,
      extra: <LayersControls />,
    },
    pages: {
      title: 'Pages',
      render: () => <PagesPanel showHeader={false} />,
      extra: <AddPageButton />,
    },
    palette: { title: 'パレット', render: () => <Palette /> },
    data: { title: 'Data', render: () => <DataSourcesPanel /> },
    audit: { title: 'UI Audit', render: () => <UIAuditPanel /> },
  }

  const [order, setOrder] = React.useState<PanelId[]>([
    'layers',
    'pages',
    'palette',
    'data',
    'audit',
  ])
  const [collapsed, setCollapsed] = React.useState<Record<PanelId, boolean>>({
    layers: false,
    pages: false,
    palette: false,
    data: false,
    audit: false,
  })

  useDndMonitor({
    onDragEnd: ({ active, over }) => {
      if (!over) return
      const activeId = active.id as PanelId
      const overId = over.id as PanelId
      setOrder((prev) => {
        if (!prev.includes(activeId) || !prev.includes(overId)) return prev
        const oldIndex = prev.indexOf(activeId)
        const newIndex = prev.indexOf(overId)
        if (oldIndex === newIndex) return prev
        return arrayMove(prev, oldIndex, newIndex)
      })
    },
  })

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950/40 p-2 flex flex-col gap-2 builder-left builder-panel left-panel">
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
            className={id === 'layers' ? 'flex-1 min-h-0' : undefined}
            contentClassName={id === 'layers' ? 'flex-1 min-h-0 overflow-y-auto' : undefined}
          >
            {panels[id].render()}
          </SortablePanel>
        ))}
      </SortableContext>
    </aside>
  )
}
