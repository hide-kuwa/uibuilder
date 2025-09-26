"use client";

import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { handleCanvasDrop } from '@/lib/dnd/paletteToCanvas'
import { getComponentDef } from '@/lib/registry/compat'
import { createNodeFromDef } from '@/lib/nodes/factory.compat'
import { callInsertAPI } from '@/lib/bridge/insert'
import DropGuide from '@/components/canvas/DropGuide'

type CanvasRootProps = {
  children?: ReactNode
  className?: string
  fallbackActive?: boolean
  pageId?: string
}

export default function CanvasRoot({ children, className, fallbackActive, pageId }: CanvasRootProps) {
  useEffect(() => {
    if (typeof document === 'undefined') return
    const onDrop = (event: DragEvent) => {
      event.preventDefault()
      handleCanvasDrop(event, {
        getDef: getComponentDef,
        createNode: createNodeFromDef,
        callInsert: callInsertAPI,
        select: (id, slotId) => {
          try { (window as any).__chizuSel = id } catch {}
          try { window.dispatchEvent(new CustomEvent('builder.selectNode', { detail: { id, slotId } })) } catch {}
        },
      })
    }
    const onDragOver = (event: DragEvent) => {
      if (!event.defaultPrevented) event.preventDefault()
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy'
    }
    document.addEventListener('drop', onDrop)
    document.addEventListener('dragover', onDragOver)
    return () => {
      document.removeEventListener('drop', onDrop)
      document.removeEventListener('dragover', onDragOver)
    }
  }, [])

  const rootId = pageId ?? 'page-root'

  return (
    <div
      className={className}
      data-safe-manifest={fallbackActive ? '1' : undefined}
      data-page-id={rootId}
      data-slot="page.root"
      data-testid="canvas-root"
      data-node-id={rootId}
      data-canvas-root
    >
      <DropGuide />
      {children}
    </div>
  )
}
