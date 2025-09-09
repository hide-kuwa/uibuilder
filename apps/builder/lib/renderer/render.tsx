'use client'
import React from 'react'
import { deepGet } from '@/lib/utils/deepGet'
import type { EnvMode } from '@/stores/env'

type Ctx = { slug: string; mode: EnvMode; runtime: any; item?: any }

export function renderNode(node: any, ctx: Ctx): React.ReactNode {
  if (!node) return null

  // Repeat node: iterate dataPath from runtime (page/app/item aware runtime can be provided by host)
  if (node.kind === 'Repeat') {
    const arr = (deepGet(ctx.runtime, node.dataPath) as any[]) || []
    if (!Array.isArray(arr) || arr.length === 0) return <div className="text-xs opacity-60">0 items</div>
    return (
      <>
        {arr.map((row, i) => (
          <div key={row?.[node.itemKey] ?? i} data-repeat-row>
            {node.children?.map((child: any, idx: number) => (
              <React.Fragment key={child?.id || idx}>{renderNode(child, { ...ctx, item: row })}</React.Fragment>
            ))}
          </div>
        ))}
      </>
    )
  }

  // Non-Repeat: defer to node.render if provided, else render children
  return node.render ? node.render(node.props || {}) : node.children?.map((c: any, i: number) => <React.Fragment key={c?.id || i}>{renderNode(c, ctx)}</React.Fragment>)
}

