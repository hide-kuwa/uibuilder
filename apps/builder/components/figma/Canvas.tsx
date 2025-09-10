'use client'
import { useFigmaStore } from '../../lib/figma/store'
import InlineTextEditor from './InlineTextEditor'
import type { Node } from '../../lib/figma/model'
import { useMemo } from 'react'
import { useState } from 'react'
import { useFigmaDevStore, type FigmaDevNode } from '../../lib/figma/store'

function NodeBox({ node }: { node: Node }) {
  const select = useFigmaStore((s) => s.select)
  const selectedIds = useFigmaStore((s) => s.selectedIds)
  const editingTextId = useFigmaStore((s) => s.editingTextId)
  const startEditingText = useFigmaStore((s) => s.startEditingText)

  const isSelected = selectedIds.includes(node.id)
  const style: React.CSSProperties = useMemo(() => ({
    position: 'absolute',
    left: node.x,
    top: node.y,
    width: node.width,
    height: node.height,
    opacity: node.style?.opacity ?? 1,
    borderRadius: node.style?.radius ?? 0,
  }), [node])

  const onClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()
    select([node.id], e.shiftKey)
  }
  const onDoubleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()
    if (node.type === 'TEXT') startEditingText(node.id)
  }

  const fill = node.type === 'TEXT' ? undefined : (node.style?.fill ? '#0000000a' : '#9ca3af22')

  return (
    <div onClick={onClick} onDoubleClick={onDoubleClick}
      style={{ ...style, background: fill, outline: isSelected ? '1px solid #3b82f6' : 'none' }}>
      {node.type === 'TEXT' && (
        <>
          <div className="select-none cursor-text p-1 text-sm">
            {editingTextId !== node.id && (node.content ?? '')}
          </div>
          {editingTextId === node.id && (
            <InlineTextEditor nodeId={node.id} initialText={node.content ?? ''} />
          )}
        </>
      )}
      {'children' in node && Array.isArray(node.children) && node.children.map((c) => (
        <NodeBox key={c.id} node={c} />
      ))}
    </div>
  )
}

export default function Canvas() {
  const page = useFigmaStore((s) => s.doc.pages[0])
  const root = page.root
  const clearSelect = useFigmaStore((s) => s.clearSelect)
  return (
    <div className="relative h-full w-full overflow-auto" onClick={() => clearSelect()}>
      <div style={{
        position: 'relative',
        width: root.width, height: root.height, left: root.x, top: root.y,
        background: '#fff',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.08)',
      }}>
        <NodeBox node={root} />
      </div>
    </div>
  )
}

function DevNodeBox({ node }: { node: FigmaDevNode }) {
  const selectNode = useFigmaDevStore((s) => s.selectNode)
  const selectedId = useFigmaDevStore((s) => s.selectedId)
  const updateNode = useFigmaDevStore((s) => s.updateNode)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(node.text ?? '')
  const isSelected = selectedId === node.id
  const onDoubleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()
    if (node.type === 'TEXT') {
      setEditing(true)
      setDraft(node.text ?? '')
    }
  }
  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter') {
      updateNode(node.id, { text: draft })
      setEditing(false)
    } else if (e.key === 'Escape') {
      setEditing(false)
      setDraft(node.text ?? '')
    }
  }
  return (
    <div
      data-node-id={node.id}
      style={{ position: 'absolute', left: node.x, top: node.y, width: node.w, height: node.h }}
      onClick={(e) => {
        e.stopPropagation()
        selectNode(node.id)
      }}
      onDoubleClick={onDoubleClick}
      className={isSelected ? 'outline outline-1 outline-blue-500' : ''}
    >
      {node.type === 'TEXT' && (
        editing ? (
          <input
            className="w-full h-full text-sm"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKeyDown}
          />
        ) : (
          <div className="text-sm select-none cursor-text">{node.text}</div>
        )
      )}
    </div>
  )
}

export function DevCanvas() {
  const nodes = useFigmaDevStore((s) => s.nodes)
  const selectNode = useFigmaDevStore((s) => s.selectNode)
  return (
    <div className="flex-1 overflow-auto bg-white" onClick={() => selectNode(null)}>
      <div className="relative w-[2000px] h-[2000px]">
        {nodes.map((n) => (
          <DevNodeBox key={n.id} node={n} />
        ))}
      </div>
    </div>
  )
}

