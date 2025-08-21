'use client'
import React, { useState } from 'react'
import { ComponentNode, useEditorState, useEditorActions } from './store'
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent, useDroppable } from '@dnd-kit/core'
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface TreeProps {
  nodes: ComponentNode[]
  path: number[]
}

const Tree: React.FC<TreeProps> = ({ nodes, path }) => {
  const id = 'drop-' + path.join('-')
  const { setNodeRef } = useDroppable({ id, data: { path: [...path, nodes.length] } })
  return (
    <div ref={setNodeRef} className="pl-2">
      <SortableContext items={nodes.map(n => n.id)} strategy={verticalListSortingStrategy}>
        {nodes.map((n, i) => (
          <TreeItem key={n.id} node={n} path={[...path, i]} />
        ))}
      </SortableContext>
    </div>
  )
}

const TreeItem: React.FC<{ node: ComponentNode; path: number[] }> = ({ node, path }) => {
  const { selectComponent, setNodeName, setHidden, setLocked } = useEditorActions()
  const { selectedIds } = useEditorState()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(node.name || '')
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: node.id,
    data: { path }
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  }
  return (
    <div>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center gap-1 px-1 cursor-pointer ${selectedIds.includes(node.id) ? 'bg-blue-100' : ''}`}
        onClick={() => selectComponent(node.id)}
        {...attributes}
        {...listeners}
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
            onKeyDown={e => {
              if (e.key === 'Enter') { setEditing(false); setNodeName(node.id, name) }
            }}
          />
        ) : (
          <span className="flex-1 text-sm" onDoubleClick={() => setEditing(true)}>
            {node.name || node.type}
          </span>
        )}
      </div>
      {node.children && node.children.length > 0 && (
        <Tree nodes={node.children} path={[...path]} />
      )}
    </div>
  )
}

const LayersPanel: React.FC = () => {
  const { tree } = useEditorState()
  const { moveNode } = useEditorActions()
  const sensors = useSensors(useSensor(PointerSensor))
  const handleDragEnd = (e: DragEndEvent) => {
    const from = e.active.data.current?.path as number[] | undefined
    const to = e.over?.data.current?.path as number[] | undefined
    if (from && to) {
      moveNode(from, to)
    }
  }
  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <Tree nodes={tree} path={[]} />
    </DndContext>
  )
}

export default LayersPanel

