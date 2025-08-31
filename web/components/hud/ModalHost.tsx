'use client'
import React from 'react'
import { createPortal } from 'react-dom'
import { useModalStore } from '@/store/modalStore'
import { useBuilderStore } from '@/store/builderStore'
import { NodeRendererCompat } from '@/components/NodeRendererCompat'

export default function ModalHost() {
  const open = useModalStore((s) => s.open)
  const contentNodeId = useModalStore((s) => s.contentNodeId)
  const close = useModalStore((s) => s.close)
  const elements = useBuilderStore((s) => s.elements)
  if (!open) return null
  const node = (elements as any[]).find((e) => e.id === contentNodeId)
  const overlay = (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center" onClick={close}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 max-w-[90vw] max-h-[90vh] overflow-auto" onClick={(e)=>e.stopPropagation()}>
        {node ? <NodeRendererCompat node={node as any} /> : <div className="text-sm opacity-70">Missing node</div>}
        <div className="mt-3 text-right">
          <button className="border rounded px-3 h-8" onClick={close}>Close</button>
        </div>
      </div>
    </div>
  )
  return typeof document !== 'undefined' ? createPortal(overlay, document.body) : null
}
