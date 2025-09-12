'use client'
import { useEffect, useMemo, useRef } from 'react'
import { useFigmaStore } from '../../lib/figma/store'
import InlineTextEditor from './InlineTextEditor'
import type { Node } from '../../lib/figma/model'
import GuideOverlay from './GuideOverlay'
import Selection from './Selection'

function NodeBox({ node, parentIsStack=false }: { node: Node, parentIsStack?: boolean }) {
  const select = useFigmaStore((s) => s.select)
  const selectedIds = useFigmaStore((s) => s.selectedIds)
  const editingTextId = useFigmaStore((s) => s.editingTextId)
  const beginTransform = useFigmaStore((s) => s.beginTransform)
  const setGhostRect = useFigmaStore((s) => s.setGhostRect)
  const commitGhost = useFigmaStore((s) => s.commitGhost)
  const cancelGhost = useFigmaStore((s) => s.cancelGhost)
  const applySnap = useFigmaStore((s) => s.applySnap)
  const duplicateNode = useFigmaStore((s) => s.duplicateNode)
  const startEditingText = useFigmaStore((s) => s.startEditingText)

  const isSelected = selectedIds.includes(node.id)
  const style: React.CSSProperties = useMemo(() => {
    const base: React.CSSProperties = {
      width: node.width,
      height: node.height,
      opacity: node.style?.opacity ?? 1,
      borderRadius: node.style?.radius ?? 0,
    }
    if (parentIsStack) {
      // relative flow inside stack
      return { position: 'relative', ...base }
    }
    return { position: 'absolute', left: node.x, top: node.y, ...base }
  }, [node, parentIsStack])

  const onClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()
    select([node.id], e.shiftKey)
  }
  const onDoubleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()
    if (node.type === 'TEXT') startEditingText(node.id)
  }

  // drag/move（リサイズは Selection.tsx に委譲）
  const onPointerDownMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (editingTextId) return
    if (e.button !== 0) return
    // v0: Stack 内では移動を無効化（リサイズは Selection 側）
    if (parentIsStack) return

    const rectStart = { x: node.x, y: node.y, width: node.width, height: node.height }
    let id = node.id
    if (e.altKey) {
      // Alt+Drag duplicate
      id = duplicateNode(node.id) ?? node.id
    }
    select([id], e.shiftKey)
    beginTransform(id)
    const origin = { x: e.clientX, y: e.clientY }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const onMove = (ev: PointerEvent) => {
      const dx = ev.clientX - origin.x
      const dy = ev.clientY - origin.y
      const x = rectStart.x + dx
      const y = rectStart.y + dy
      const snapped = applySnap({ id, x, y, width: rectStart.width, height: rectStart.height })
      setGhostRect(snapped)
    }
    const onUp = () => {
      ;(e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId)
      commitGhost()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp, { once: true })
  }

  const fill = node.type === 'TEXT' ? undefined : (node.style?.fill ? '#0000000a' : '#9ca3af22')

  return (
    <div onClick={onClick} onDoubleClick={onDoubleClick} onPointerDown={onPointerDownMove}
      style={{ ...style, background: fill }}>
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
      {isSelected && <Selection node={node} />}

      {'children' in node && Array.isArray(node.children) && node.children.map((c) => (
        <NodeBox key={c.id} node={c} parentIsStack={node.type==='STACK'} />
      ))}
    </div>
  )
}

export default function Canvas() {
  const page = useFigmaStore((s) => s.doc.pages[0])
  const root = page.root
  const clearSelect = useFigmaStore((s) => s.clearSelect)
  const selected = useFigmaStore((s) => s.selectedNode)
  const updateNode = useFigmaStore((s) => s.updateNode)
  const cancelGhost = useFigmaStore((s) => s.cancelGhost)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selected) return
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        const step = e.shiftKey ? 10 : 1
        let dx = 0, dy = 0
        if (e.key === 'ArrowLeft') dx = -step
        if (e.key === 'ArrowRight') dx = step
        if (e.key === 'ArrowUp') dy = -step
        if (e.key === 'ArrowDown') dy = step
        updateNode(selected.id, { x: (selected as any).x + dx, y: (selected as any).y + dy })
        e.preventDefault()
      }
      if (e.key === 'Escape') {
        cancelGhost()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selected, updateNode, cancelGhost])

  return (
    <div ref={ref} className="relative h-full w-full overflow-auto" onClick={() => clearSelect()}>
      <div style={{
        position: 'relative',
        width: root.width, height: root.height, left: root.x, top: root.y,
        background: '#ffffff',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.06), 0 2px 12px rgba(0,0,0,0.08)',
      }}>
        <NodeBox node={root} />
        <GuideOverlay />
      </div>
    </div>
  )
}
