'use client'
import * as React from 'react'
import { useInteractionRegistry } from '@/store/interactionRegistry'
import { buildCombinedCss } from '@/lib/interactionCss'
import type { Effect } from '@/types/interactions'

interface Props {
  nodeId: string
  presetIds?: string[] | null
  presetId?: string | null
  hoverEffects?: Effect[] | null
  hoverTransitionMs?: number | null
}

export default function PresetStyle({
  nodeId,
  presetIds,
  presetId,
  hoverEffects,
  hoverTransitionMs,
}: Props) {
  const { presets } = useInteractionRegistry()
  const ids = Array.isArray(presetIds)
    ? presetIds
    : presetId
      ? [presetId]
      : []

  const chosen = presets.filter((p) => ids.includes(p.id))
  const css = buildCombinedCss(
    nodeId,
    chosen,
    hoverEffects || undefined,
    hoverTransitionMs || undefined,
  )

  return css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null
}

