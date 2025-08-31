'use client'

import React from 'react'
import { useEditorActions, ComponentNode } from './store'
import { registry } from '@/lib/registry.ts'
import { resolveBinding } from '@/lib/binding/resolve'
import { useRects } from './canvas/RectsStore'
import { NodeWrapper } from '@/components/shared/NodeWrapper'
import { useActionRunner } from '@/lib/actions/runActions'

export function InstanceView({ inst, children }: { inst: any; children: React.ReactNode }) {
  const run = useActionRunner()
  const onClick = React.useCallback(
    (e: React.MouseEvent) => {
      if (!inst?.actions?.onClick?.length) return
      run(inst.actions.onClick, { nodeId: inst.id })
    },
    [inst, run],
  )
  return <div onClick={onClick}>{children}</div>
}

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
  const rendered = (
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
  )
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
      <InstanceView inst={node}>{rendered}</InstanceView>
    </NodeWrapper>
  )
}

export default NodeRenderer
