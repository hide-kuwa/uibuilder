'use client'
import React from 'react'
import { toInstanceLike } from '@/lib/legacyAdapter'
import { resolveProps } from '@/lib/resolveProps'
import type { InstanceLike } from '@/types/instanceLike'
import { getDef } from '@/lib/registry'
import { NodeWrapper } from '@/components/shared/NodeWrapper'
import { useActionRunner } from '@/lib/actions/runActions'

export function NodeRendererCompat({ node }: { node: any }) {
  const inst: InstanceLike = toInstanceLike(node)
  const def = getDef(inst.componentId as any) as any
  if (!def?.cmp) return null
  const run = useActionRunner()
  const props = resolveProps({ defDefault: def.defaultProps, variants: def.variants, inst })
  const Cmp = def.cmp
  const onClick = inst.actions?.onClick?.length ? () => run(inst.actions?.onClick, { nodeId: inst.id }) : undefined
  return (
    <NodeWrapper nodeId={inst.id} nodeType={def.key || inst.componentId} nodeName={inst.name} presetId={undefined}>
      <div style={{ position: 'absolute', left: inst.x ?? 0, top: inst.y ?? 0, width: inst.w ?? undefined, height: inst.h ?? undefined }} onClick={onClick}>
        <Cmp {...props} />
        {Array.isArray(inst.children) && inst.children.map((ch:any)=><NodeRendererCompat key={String(ch.id)} node={ch} />)}
      </div>
    </NodeWrapper>
  )
}
