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

  const props: any = node.props || {}
  const ids: string[] = Array.isArray(props.presetIds)
    ? props.presetIds
    : (props.presetId ? [props.presetId] : [])

  const chosen = presets.filter((p) => ids.includes(p.id))
  const inline = props.hoverEffects as Effect[] | undefined
  const ms = props.hoverTransitionMs as number | undefined
  const css = buildCombinedCss(node.id, chosen, inline, ms)

  return css ? <style dangerouslySetInnerHTML={{ __html: css }} /> : null
}

