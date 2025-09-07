// apps/builder/components/rightpane/PublishPanel.tsx
'use client'
import React from 'react'
import { PublishSummary } from '@chizu/registry'
import { useLineage } from '@chizu/ui/hooks/useLineage'
import { aggregateFlags } from '@chizu/ui/lineage/flags'

export function PublishPanel({ nodeId = 'sheet:交際費集計' }: { nodeId?: string }) {
  const { data } = useLineage()
  const flags = data ? aggregateFlags(data as any, nodeId) : { rounded:false, taxAdjust:false, manualAdjust:false }
  return (
    <div className="p-3">
      <PublishSummary flags={flags} onLockToggle={() => { /* append-only: wire later */ }} />
    </div>
  )
}

