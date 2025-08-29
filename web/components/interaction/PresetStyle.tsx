'use client'
import * as React from 'react'
import { useInteractionRegistry } from '@/store/interactionRegistry'
import { buildCombinedCss } from '@/lib/interactionCss'
import type { Effect } from '@/types/interactions'

type Props = {
  nodeId: string
  // これらが渡ってきたらストアは参照しない（/builder 用）
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

  const ids =
    (presetIds && presetIds.length ? presetIds : (presetId ? [presetId] : [])) ?? []

  const chosen = presets.filter((p) => ids.includes(p.id))
  const css = buildCombinedCss(
    nodeId,
    chosen,
    hoverEffects ?? undefined,
    hoverTransitionMs ?? undefined
  )

  return css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null
}

