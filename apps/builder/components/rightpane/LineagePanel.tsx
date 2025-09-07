// apps/builder/components/rightpane/LineagePanel.tsx
'use client'
import React from 'react'
import { BacklinkList, NodeInspectorV2 } from '@chizu/registry'

export function LineagePanel({
  selectedId, onSelect, title = 'Lineage',
}: { selectedId?: string; onSelect?: (id: string)=>void; title?: string }) {
  return (
    <div className="p-3 space-y-4">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="grid grid-cols-2 gap-4">
        <BacklinkList selectedId={selectedId} onSelect={onSelect} />
        <NodeInspectorV2 selectedId={selectedId} />
      </div>
    </div>
  )
}

