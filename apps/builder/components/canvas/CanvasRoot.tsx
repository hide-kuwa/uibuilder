'use client'

import React, { useEffect } from 'react'

import { handleCanvasDrop } from '@/lib/dnd/paletteToCanvas'
import { callInsertAPI } from '@/lib/bridge/insert'
import { getComponentDef } from '@/lib/registry/compat'
import { createNodeFromDef } from '@/lib/nodes/factory.compat'

export function CanvasRoot({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const onDrop = (e: DragEvent) => {
      e.preventDefault()
      handleCanvasDrop(e, {
        getDef: getComponentDef,
        createNode: createNodeFromDef,
        callInsert: callInsertAPI,
      })
    }
    const onDragOver = (e: DragEvent) => e.preventDefault()
    document.addEventListener('drop', onDrop)
    document.addEventListener('dragover', onDragOver)
    return () => {
      document.removeEventListener('drop', onDrop)
      document.removeEventListener('dragover', onDragOver)
    }
  }, [])

  return (
    <div className="relative w-full h-full" data-actions-enabled="true">
      {children}
    </div>
  )
}

export default CanvasRoot
