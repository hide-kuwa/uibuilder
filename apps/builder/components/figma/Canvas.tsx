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

  const style: React.CSSProperties = useMemo(() => {
    const s = node.style ?? {}
    const bg = (() => {
      if (!s.fill) return undefined
      if (typeof s.fill === 'string') return s.fill
      const stops = s.fill.stops
        .map((st) => `${st.color} ${st.offset * 100}%`)
        .join(', ')
      return s.fill.type === 'linear'
        ? `linear-gradient(${s.fill.angle ?? 0}deg, ${stops})`
        : `radial-gradient(${stops})`
    })()
    const radius = (() => {
      if (s.radius == null) return undefined
      if (typeof s.radius === 'number') return s.radius
      return `${s.radius.tl}px ${s.radius.tr}px ${s.radius.br}px ${s.radius.bl}px`
    })()
    const boxShadow = s.shadows
      ? s.shadows
          .map((sh) =>
            `${sh.x}px ${sh.y}px ${sh.blur}px ${sh.spread}px ${sh.color}`
          )
          .join(', ')
      : undefined
    const transform = [
      `translate(${node.x}px, ${node.y}px)`,
      `rotate(${s.rotateDeg ?? 0}deg)`,
      `skew(${s.skewXDeg ?? 0}deg, ${s.skewYDeg ?? 0}deg)`,
      `scale(${s.scaleX ?? 1}, ${s.scaleY ?? 1})`,
    ].join(' ')
    const originMap = {
      TL: 'top left',
      TC: 'top center',
      TR: 'top right',
      CL: 'center left',
      C: 'center',
      CR: 'center right',
      BL: 'bottom left',
      BC: 'bottom center',
      BR: 'bottom right',
    } as const
    const transformOrigin = originMap[s.transformOrigin ?? 'TL']
    const transition = node.motion?.transition
      ?.map(
        (t) =>
          `${t.property} ${t.durationMs}ms ${t.easing ?? 'ease'} ${t.delayMs ?? 0}ms`
      )
      .join(', ')
    return {
      position: 'absolute',
      width: node.width,
      height: node.height,
      transform,
      transformOrigin,
      opacity: s.opacity,
      borderRadius: radius,
      background: bg,
      border:
        s.stroke || s.strokeWidth
          ? `${s.strokeWidth ?? 0}px solid ${s.stroke ?? 'transparent'}`
          : undefined,
      boxShadow,
      mixBlendMode: s.mixBlendMode,
      filter: s.filter,
      backdropFilter: s.backdropFilter,
      backgroundImage: s.backgroundImage,
      backgroundSize: s.backgroundSize,
      backgroundPosition: s.backgroundPosition,
      transition,
    } as React.CSSProperties
  }, [node])

  const onClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()
    select([node.id], e.shiftKey)
  }
  const onDoubleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation()
    if (node.type === 'TEXT') startEditingText(node.id)
  }

  return (
    <div onClick={onClick} onDoubleClick={onDoubleClick} style={style}>
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
  const canvasW = root.width + root.x * 2
  const canvasH = root.height + root.y * 2
  return (
    <div className="relative h-full w-full overflow-auto" onClick={() => clearSelect()}>
      <div style={{ position: 'relative', width: canvasW, height: canvasH }}>
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

