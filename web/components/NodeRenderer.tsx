'use client'

import React from 'react'
import { useEditorActions, ComponentNode } from './store'
import { registry } from '@/lib/registry.ts'
import { resolveBinding } from '@/lib/binding/resolve'
import { useRects } from './canvas/RectsStore'
import { NodeWrapper } from '@/components/shared/NodeWrapper'

export function NodeRenderer({ node }: { node: ComponentNode }) {
  const { selectComponent } = useEditorActions()
  const { setRect } = useRects()
  const ref = React.useRef<HTMLDivElement>(null)
  const entry = (registry as any)[node.type]
  const Comp = entry?.cmp || ((p: any) => <div {...p}>{p.children}</div>)
  const style = node.props?.style || {}
  let resolvedProps = node.propValues || {}
  if (node.propValues) {
    resolvedProps = resolveBinding(resolvedProps, [], [])
  }

 

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

  const nodeName = node.name || node.props?.name
  return (
    <NodeWrapper
      nodeId={node.id}
      nodeType={node.type}
      nodeName={nodeName}
      presetIds={node.props?.presetIds}
      presetId={node.props?.presetId}
      hoverEffects={node.props?.hoverEffects}
      hoverTransitionMs={node.props?.hoverTransitionMs}
    >
      <div
        ref={ref}
        style={{ position: 'absolute', ...style }}
        onMouseDown={(e) => {
          e.stopPropagation()
          selectComponent(node.id)
        }}
      >
        <Comp {...resolvedProps}>
          {node.children?.map((child) => (
            <NodeRenderer key={child.id} node={child} />
          ))}
        </Comp>
      </div>
    </NodeWrapper>
  )
}

export default NodeRenderer
