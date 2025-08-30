'use client'
import * as React from 'react'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { useBuilderStore, type Elm } from '@/store/builderStore'
import PresetStyle from '@/components/interaction/PresetStyle'
import { CanvasOverlay } from './CanvasOverlay'
import { HeaderView } from './header/HeaderView'
import { FooterView } from './footer/FooterView'
import { SidebarView } from '@/components/app/SidebarView'
import ResizeHandles from './ResizeHandles'

function ElmContent({ elm }: { elm: Elm }) {
  switch (elm.type) {
    case 'header':
      return <HeaderView elm={elm} />
    case 'footer':
      return <FooterView elm={elm} />
    case 'sidebar':
      return <SidebarView elm={elm} />
    case 'button':
      return (
        <button
          className="h-full w-full flex items-center justify-center rounded"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {elm.props?.text ?? 'Button'}
        </button>
      )
    case 'text':
      return (
        <div
          className="h-full w-full flex items-center justify-center"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {elm.props?.text ?? 'Text'}
        </div>
      )
    case 'container':
      return (
        <div
          className="h-full w-full"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {elm.props?.text}
        </div>
      )
    case 'code':
      return (
        <div
          className="h-full w-full flex items-center justify-center"
          onPointerDown={(e) => e.stopPropagation()}
        >
          {elm.code?.displayName || 'Code'}
        </div>
      )
    case 'hud':
      return (
        <div
          className="h-full w-full flex items-center justify-center"
          onPointerDown={(e) => e.stopPropagation()}
        >
          HUD
        </div>
      )
    default:
      return null
  }
}

function ElmView({ elm }: { elm: Elm }) {
  const select = useBuilderStore((s) => s.select)
  const selectedId = useBuilderStore((s) => s.selectedId)
  const isSel = selectedId === elm.id
  const dragDraft = useBuilderStore((s) => s.ui.dragDraft)

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `elm_${elm.id}`,
    data: { from: 'canvas', id: elm.id, anchorX: elm.w / 2, anchorY: elm.h / 2 },
  })

  const preview = dragDraft && dragDraft.id === elm.id ? dragDraft.rect : null
  const baseStyle: React.CSSProperties = {
    left: elm.x,
    top: elm.y,
    width: preview ? preview.w : elm.w,
    height: preview ? preview.h : elm.h,
    background: elm.props?.bg,
    color: elm.props?.color ?? '#e5e7eb',
    opacity: elm.visible === false ? 0.4 : 1,
    transform: preview
      ? `translate3d(${preview.x - elm.x}px, ${preview.y - elm.y}px, 0)`
      : undefined,
    position: 'absolute',
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onMouseDown={() => select(elm.id)}
      className={`absolute rounded border text-[12px] select-none ${
        isSel ? 'border-amber-400 shadow-[0_0_0_1px_rgba(251,191,36,0.6)]' : 'border-zinc-700'
      } ${isDragging ? 'opacity-60 cursor-move' : ''}`}
      style={baseStyle}
      data-node-id={elm.id}
      data-node-type={elm.type}
      data-node-name={elm.props?.name}
      data-interacting={isDragging ? 'true' : undefined}
    >
      <ElmContent elm={elm} />
      <PresetStyle
        nodeId={elm.id}
        presetIds={elm.props?.presetIds}
        presetId={elm.props?.presetId}
        hoverEffects={elm.props?.hoverEffects}
        hoverTransitionMs={elm.props?.hoverTransitionMs}
      />
      {isSel && <ResizeHandles elm={elm} />}
    </div>
  )
}

export function Canvas({
  canvasRef,
}: {
  canvasRef?: React.RefObject<HTMLDivElement>
}) {
  const elements = useBuilderStore((s) => s.elements)
  const { setNodeRef } = useDroppable({ id: 'CANVAS' })

  const ref = React.useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node)
      if (canvasRef) canvasRef.current = node
    },
    [setNodeRef, canvasRef],
  )

  return (
    <div ref={ref} className="absolute inset-0" data-canvas-root>
      {elements.map((elm) => (
        <ElmView key={elm.id} elm={elm} />
      ))}
      <CanvasOverlay />
    </div>
  )
}

export default Canvas
