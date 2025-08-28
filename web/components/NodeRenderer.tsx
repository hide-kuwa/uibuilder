'use client'

import React from 'react'
import { useEditorActions, ComponentNode } from './store'
import { registry } from '@/lib/registry'
import { useInteractionRegistry } from '@/store/interactionRegistry'
import { buildCombinedCss } from '@/lib/interactionCss'
import type { Effect } from '@/types/interactions'
import { useEditorUIStore } from '@/store/editorUIStore'
import { useRects } from './canvas/RectsStore'

export function NodeRenderer({ node }: { node: ComponentNode }) {
  const { selectComponent } = useEditorActions()
  const { setRect } = useRects()
  const ref = React.useRef<HTMLDivElement>(null)
  const Comp = (registry as any)[node.type] || ((p: any) => <div {...p}>{p.children}</div>)
  const style = node.props?.style || {}

  const { presets, projectDefaultPresetIds } = useInteractionRegistry()
  const ownIds: string[] = Array.isArray(node.props?.presetIds)
    ? (node.props?.presetIds as string[])
    : node.props?.presetId
    ? [node.props.presetId]
    : []
  const effectiveIds = ownIds.length ? ownIds : projectDefaultPresetIds ?? []
  const chosen = presets.filter((p) => effectiveIds.includes(p.id))

  const inlineHover = node.props?.hoverEffects as Effect[] | undefined
  const inlineMs = node.props?.hoverTransitionMs as number | undefined
  const interacting = useEditorUIStore((s) => s.interactingIds.has(node.id))

  const [gate, setGate] = React.useState(true)
  React.useEffect(() => {
    setGate(!!document.querySelector('[data-actions-enabled="true"]'))
  }, [])

  const css = buildCombinedCss(node.id, chosen, inlineHover, inlineMs, { gate })

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const root = el.closest('[data-canvas-root]') as HTMLElement | null
    const r = el.getBoundingClientRect()
    const base = root?.getBoundingClientRect()
    const x = base ? r.left - base.left : r.left
    const y = base ? r.top - base.top : r.top
    setRect(node.id, { x, y, w: r.width, h: r.height })
  })

  return (
    <div
      ref={ref}
      data-node-id={node.id}
      data-node-type={node.type}
      data-node-name={node.props?.name}
      data-interacting={interacting ? 'true' : undefined}
      style={{ position: 'absolute', ...style }}
      onMouseDown={(e) => {
        e.stopPropagation()
        selectComponent(node.id)
      }}
    >
      <Comp {...node.props}>
        {node.children?.map((child) => (
          <NodeRenderer key={child.id} node={child} />
        ))}
      </Comp>
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
    </div>
  )
}

export default NodeRenderer
