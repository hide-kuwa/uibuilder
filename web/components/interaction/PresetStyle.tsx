'use client'
import * as React from 'react'
import { useInteractionRegistry } from '@/store/interactionRegistry'
import { useEditorStore } from '@/store/editorStore'
import { buildCombinedCss } from '@/lib/interactionCss'
import type { Effect } from '@/types/interactions'

export default function PresetStyle({ nodeId }: { nodeId: string }) {
  const node = useEditorStore((s) => s.tree.find((n:any) => n.id === nodeId))
  const { presets } = useInteractionRegistry()
  if (!node) return null

  const ids: string[] = Array.isArray(node.props?.presetIds)
    ? node.props.presetIds
    : (node.props?.presetId ? [node.props.presetId] : [])

  const chosen = presets.filter((p) => ids.includes(p.id))
  const inline = node.props?.hoverEffects as Effect[] | undefined
  const ms = node.props?.hoverTransitionMs as number | undefined
  const css = buildCombinedCss(node.id, chosen, inline, ms)

  return css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null
}

