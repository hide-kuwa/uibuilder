'use client'

import { useEffect, useRef, memo, useMemo, cloneElement, Children } from 'react'
import type React from 'react'
import { useBuilderStore } from '@/stores/builder'
import { computeBgColor, buildMotionFromStatus } from '@/lib/status-engine'
import { animate } from 'animejs'

interface Props {
  id: string
  children: React.ReactElement
}

const DEFAULT_STATUS = { base: 'notVisited', overlays: [] as string[] }

const DraggableNodeWrapper = memo(
  function DraggableNodeWrapper({ id, children }: Props) {
    const status = useBuilderStore((s) => {
      const cur = s.getNodeStatus(id)
      return cur.base === DEFAULT_STATUS.base && cur.overlays.length === 0
        ? DEFAULT_STATUS
        : cur
    })
    const cfg = useBuilderStore((s) => s.statusConfig)
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
    const prev = useRef<typeof status>()
    useEffect(() => {
      let a: ReturnType<typeof animate> | undefined
      if (
        ref.current &&
        prev.current &&
        (prev.current.base !== status.base || prev.current.overlays !== status.overlays)
      ) {
        a = animate({
          targets: ref.current,
          scale: [1, 1.05],
          opacity: [1, 0.6],
          direction: 'alternate',
          duration: 200,
          easing: 'easeOutSine',
        })
      }
      prev.current = status
      return () => a?.pause()
    }, [status])

    const child = Children.only(children)
    return cloneElement(child, {
      ref,
      'data-node-id': id,
      style: { background: bg, filter, ...child.props.style },
    })
  },
  (prev, next) => prev.id === next.id && prev.children === next.children,
)

export default DraggableNodeWrapper

