'use client'
import { runMotionEffects } from '@/lib/runMotion'
import { buildMotionFromStatus, computeBgColor } from '@/lib/status-engine'
import type { ReactNode } from 'react'

export default function InteractiveWrapper({ node, children }:{ node:any; children: ReactNode }) {
  const status = (node.status as import('@/types/status').NodeStatus) ?? { base:'notVisited', overlays:[] }
  const bg = computeBgColor(status)
  const statusEff = buildMotionFromStatus(node.id, status)

  return (
    <div
      data-node-id={node.id}
      style={{ backgroundColor: bg }}
      onMouseEnter={(e)=> runMotionEffects(statusEff.hoverEnter, 'hoverEnter', e.currentTarget as HTMLElement)}
      onMouseLeave={(e)=> { /* hoverLeave は stop 用に remove も可 */ runMotionEffects(statusEff.hoverLeave, 'hoverLeave', e.currentTarget as HTMLElement) }}
      onClick={(e)=> runMotionEffects(node?.effects?.motion, 'click', e.currentTarget as HTMLElement)}
      onDoubleClick={(e)=> runMotionEffects(node?.effects?.motion, 'doubleClick', e.currentTarget as HTMLElement)}
      ref={(el)=>{ if (el) queueMicrotask(()=> {
        runMotionEffects(statusEff.mount, 'mount', el)
        runMotionEffects(node?.effects?.motion, 'mount', el)
      })}}
    >
      {children}
    </div>
  )
}
