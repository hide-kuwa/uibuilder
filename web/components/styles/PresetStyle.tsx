'use client'
import React, { useMemo } from 'react'
import { buildCombinedCss } from '@/lib/presetCss'
import type { Effect } from '@/types/interactions'

interface Props {
  nodeId: string
  presetIds?: string[] | null
  presetId?: string | null
  hoverEffects?: Effect[] | null
  hoverTransitionMs?: number | null
}

export function PresetStyle({
  nodeId,
  presetIds,
  presetId,
  hoverEffects,
  hoverTransitionMs,
}: Props) {
  const css = useMemo(
    () =>
      buildCombinedCss({
        nodeId,
        presetIds,
        presetId,
        hoverEffects,
        hoverTransitionMs,
      }),
    [nodeId, presetIds, presetId, hoverEffects, hoverTransitionMs],
  )

  if (!css) return null
  return <style data-owner="preset-style" data-node-id={nodeId} dangerouslySetInnerHTML={{ __html: css }} />
}

