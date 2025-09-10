'use client'
import { useFigmaStore } from '../../lib/figma/store'
import InlineTextEditor from './InlineTextEditor'
import type { Node } from '../../lib/figma/model'
import { useMemo } from 'react'

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

