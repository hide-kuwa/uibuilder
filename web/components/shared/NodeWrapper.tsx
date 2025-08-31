'use client'
import React from 'react'
import { PresetStyle } from '@/components/styles/PresetStyle'

type Props = {
  nodeId: string
  nodeType?: string
  nodeName?: string
  presetIds?: string[]
  presetId?: string
  hoverEffects?: any
  hoverTransitionMs?: number
  children: React.ReactNode
}

export function NodeWrapper({
  nodeId,
  nodeType,
  nodeName,
  presetIds,
  presetId,
  hoverEffects,
  hoverTransitionMs,
  children,
}: Props) {
  return (
    <div data-node-id={nodeId} data-node-type={nodeType} data-node-name={nodeName}>
      {/* data-node-id is used by interaction runtime (e.g. scrollTo) */}
      <PresetStyle
        nodeId={nodeId}
        presetIds={presetIds}
        presetId={presetId}
        hoverEffects={hoverEffects}
        hoverTransitionMs={hoverTransitionMs}
      />
      {children}
    </div>
  )
}
