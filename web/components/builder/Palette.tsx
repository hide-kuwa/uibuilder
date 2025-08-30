'use client'
import React from 'react'
import { useDraggable } from '@dnd-kit/core'
import type { ElmType } from '@/store/builderStore'
import { registry, type RegistryKey } from '@/lib/registry'
import { loadDocgenMeta, type DocgenMetaItem } from '@/lib/builder/docgen'

function DraggableItem({ type, label }: { type: ElmType; label: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `pal_${type}`,
    data: { from: 'palette', type },
  })
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`text-xs px-2 py-1 rounded border border-zinc-700 hover:bg-zinc-800 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-60' : ''
      }`}
    >
      {label}
    </div>
  )
}

function CodeItem({ meta }: { meta: DocgenMetaItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `code_${meta.displayName}_${meta.importPath}`,
    data: { from: 'palette', type: 'code', meta },
  })
  const label = meta.displayName || meta.importPath
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`text-xs px-2 py-1 rounded border border-zinc-700 hover:bg-zinc-800 cursor-grab active:cursor-grabbing ${
        isDragging ? 'opacity-60' : ''
      }`}
    >
      {label}
    </div>
  )
}

export function Palette() {
  const items: { type: RegistryKey; label: string }[] = Object.entries(registry).map(
    ([key, value]) => ({ type: key as RegistryKey, label: value.meta.displayName }),
  )
  const [tab, setTab] = React.useState<'basic' | 'code'>('basic')
  const [codes, setCodes] = React.useState<DocgenMetaItem[]>([])
  React.useEffect(() => {
    loadDocgenMeta().then(setCodes)
  }, [])
  return (
    <div className="text-xs">
      <div className="flex gap-2 mb-2">
        <button
          className={`px-2 py-1 rounded border border-zinc-700 ${
            tab === 'basic' ? 'bg-zinc-800' : 'bg-zinc-900'
          }`}
          onClick={() => setTab('basic')}
        >
          Elements
        </button>
        <button
          className={`px-2 py-1 rounded border border-zinc-700 ${
            tab === 'code' ? 'bg-zinc-800' : 'bg-zinc-900'
          }`}
          onClick={() => setTab('code')}
        >
          Code Components
        </button>
      </div>
      {tab === 'basic' && (
        <div className="grid grid-cols-2 gap-2">
          {items.map((it) => (
            <DraggableItem key={it.type} type={it.type} label={it.label} />
          ))}
          <p className="col-span-2 text-[11px] text-zinc-400 mt-2">
            パレットからキャンバスへドラッグ＆ドロップで配置できます
          </p>
        </div>
      )}
      {tab === 'code' && (
        <div className="grid grid-cols-2 gap-2">
          {codes.map((m) => (
            <CodeItem key={`${m.importPath}-${m.displayName}`} meta={m} />
          ))}
          {codes.length === 0 && (
            <p className="col-span-2 text-[11px] text-zinc-400 mt-2">
              component-meta.json がありません
            </p>
          )}
        </div>
      )}
    </div>
  )
}

