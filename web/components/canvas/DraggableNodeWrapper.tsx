'use client'

import { useEffect, useRef } from 'react'
import type React from 'react'
import { useBuilderStore } from '@/stores/builder'
import { computeBgColor, buildMotionFromStatus } from '@/lib/status-engine'
import { animate } from 'animejs'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  children: React.ReactNode
}

export default function DraggableNodeWrapper({ id, style, className, children, ...rest }: Props) {
  const cfg = useBuilderStore((s) => s.statusConfig)
  const status = useBuilderStore((s) => s.getNodeStatus(id))
  const ref = useRef<HTMLDivElement>(null)
  const { bg, filter } = computeBgColor(status, cfg)
  const motion = buildMotionFromStatus(id, status, cfg)

  // pulse animation
  useEffect(() => {
    if (!ref.current || !motion) return
    const inst = animate({ targets: ref.current, loop: true, ...motion })
    return () => inst.pause()
  }, [motion])

  // flash animation on status change
  const prev = useRef<{ base: string; overlays: string }>()
  useEffect(() => {
    const cur = { base: status.base, overlays: status.overlays.join(',') }
    let a: ReturnType<typeof animate> | undefined
    if (ref.current && prev.current) {
      if (prev.current.base !== cur.base || prev.current.overlays !== cur.overlays) {
        a = animate({
          targets: ref.current,
          scale: [1, 1.05],
          opacity: [1, 0.6],
          direction: 'alternate',
          duration: 200,
          easing: 'easeOutSine',
        })
      }
    }
    prev.current = cur
    return () => a?.pause()
  }, [status.base, status.overlays.join(',')])

  return (
    <div
      ref={ref}
      data-node-id={id}
      style={{ background: bg, filter, ...style }}
      className={className}
      {...rest}
    >
      {children}
    </div>
  )
}

