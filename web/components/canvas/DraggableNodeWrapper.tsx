'use client'

import { useEffect, useRef, memo, useMemo } from 'react'
import type React from 'react'
import { useBuilderStore } from '@/stores/builder'
import { computeBgColor, buildMotionFromStatus } from '@/lib/status-engine'
import { animate } from 'animejs'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  id: string
  children: React.ReactNode
}

const DEFAULT_STATUS = { base: 'notVisited', overlays: [] as string[] }

const DraggableNodeWrapper = memo(
  function DraggableNodeWrapper({ id, style, className, children, ...rest }: Props) {
    const cfg = useBuilderStore((s) => s.statusConfig)
    const base = useBuilderStore((s) => s.statuses[id]?.base ?? DEFAULT_STATUS.base)
    const overlays = useBuilderStore((s) => s.statuses[id]?.overlays ?? DEFAULT_STATUS.overlays)
    const status = useMemo(() => ({ base, overlays }), [base, overlays])
    const ref = useRef<HTMLDivElement>(null)
    const { bg, filter } = useMemo(() => computeBgColor(status, cfg), [status, cfg])
    const motion = useMemo(() => buildMotionFromStatus(id, status, cfg), [id, status, cfg])

    // pulse animation
    useEffect(() => {
      if (!ref.current || !motion) return
      const inst = animate({ targets: ref.current, loop: true, ...motion })
      return () => inst.pause()
    }, [motion])

    // flash animation on status change
    const prev = useRef<{ base: string; overlays: string[] }>()
    useEffect(() => {
      const cur = { base, overlays }
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
    }, [base, overlays])

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
  },
  (prev, next) =>
    prev.id === next.id &&
    prev.children === next.children &&
    prev.className === next.className &&
    prev.style === next.style,
)

export default DraggableNodeWrapper

