import { useInteractionRegistry } from '@/store/interactionRegistry'
import { buildCombinedCss as buildCss } from '@/lib/interactionCss'
import type { Effect } from '@/types/interactions'

type Options = {
  nodeId: string
  presetIds?: string[]
  presetId?: string
  hoverEffects?: Effect[]
  hoverTransitionMs?: number
}

export function buildCombinedCss({ nodeId, presetIds, presetId, hoverEffects, hoverTransitionMs }: Options) {
  const { presets } = useInteractionRegistry.getState()
  const ids = Array.isArray(presetIds) ? presetIds : presetId ? [presetId] : []
  const chosen = presets.filter((p) => ids.includes(p.id))
  return buildCss(nodeId, chosen, hoverEffects, hoverTransitionMs)
}
