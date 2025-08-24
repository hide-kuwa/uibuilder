'use client'
import React, { useMemo, useRef, useState } from 'react'
import { useEditorState, useEditorActions } from './store'
import { filterLayers, FlattenedLayer } from '@/lib/layers/filter'

const ITEM_HEIGHT = 24

const TreeItem: React.FC<{ item: FlattenedLayer; top: number; selected: boolean }> = ({ item, top, selected }) => {
  const { selectComponent, setNodeName, setHidden, setLocked } = useEditorActions()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(item.node.name || '')
  const { node, depth } = item
  return (
    <div
      style={{ position: 'absolute', top, left: 0, right: 0, height: ITEM_HEIGHT, paddingLeft: depth * 12 }}
      className={`flex items-center gap-1 px-1 cursor-pointer ${selected ? 'bg-blue-100' : ''}`}
      onClick={() => selectComponent(node.id)}
    >
      <button onClick={e => { e.stopPropagation(); setHidden(node.id, !node.hidden) }}>
        {node.hidden ? '🙈' : '👁'}
      </button>
      <button onClick={e => { e.stopPropagation(); setLocked(node.id, !node.locked) }}>
        {node.locked ? '🔒' : '🔓'}
      </button>
      {editing ? (
        <input
          className="border px-1 text-sm flex-1"
          value={name}
          autoFocus
          onChange={e => setName(e.target.value)}
          onBlur={() => { setEditing(false); setNodeName(node.id, name) }}
          onKeyDown={e => { if (e.key === 'Enter') { setEditing(false); setNodeName(node.id, name) } }}
        />
      ) : (
        <span className="flex-1 text-sm" onDoubleClick={() => setEditing(true)}>
          {node.name || node.type}
        </span>
      )}
    </div>
  )
}

const LayersPanel: React.FC = () => {
  const { tree, selectedIds } = useEditorState()
  const [query, setQuery] = useState('')
  const [type, setType] = useState('')
  const [lockFilter, setLockFilter] = useState('all')
  const [visFilter, setVisFilter] = useState('all')

  const layers = useMemo(() => {
    return filterLayers(tree, {
      query: query || undefined,
      type: type || undefined,
      locked: lockFilter === 'all' ? undefined : lockFilter === 'locked',
      hidden: visFilter === 'all' ? undefined : visFilter === 'hidden'
    })
  }, [tree, query, type, lockFilter, visFilter])

  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }

  const viewportHeight = containerRef.current?.clientHeight || 400
  const start = Math.floor(scrollTop / ITEM_HEIGHT)
  const end = Math.min(layers.length, start + Math.ceil(viewportHeight / ITEM_HEIGHT) + 5)
  const visible = layers.slice(start, end)

  return (
    <div className="flex flex-col h-full">
      <div className="p-1 flex gap-1 items-center">
        <input
          className="border px-1 text-sm flex-1"
          placeholder="Search"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <select className="border text-xs" value={type} onChange={e => setType(e.target.value)}>
          <option value="">All</option>
          <option value="Text">Text</option>
          <option value="Image">Image</option>
          <option value="Frame">Frame</option>
          <option value="Path">Path</option>
        </select>
        <select className="border text-xs" value={lockFilter} onChange={e => setLockFilter(e.target.value)}>
          <option value="all">Lock:All</option>
          <option value="locked">Locked</option>
          <option value="unlocked">Unlocked</option>
        </select>
        <select className="border text-xs" value={visFilter} onChange={e => setVisFilter(e.target.value)}>
          <option value="all">Vis:All</option>
          <option value="visible">Visible</option>
          <option value="hidden">Hidden</option>
        </select>
      </div>
      <div ref={containerRef} onScroll={onScroll} className="flex-1 overflow-auto relative">
        <div style={{ height: layers.length * ITEM_HEIGHT, position: 'relative' }}>
          {visible.map((item, i) => (
            <TreeItem
              key={item.node.id}
              item={item}
              top={(start + i) * ITEM_HEIGHT}
              selected={selectedIds.includes(item.node.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default LayersPanel

