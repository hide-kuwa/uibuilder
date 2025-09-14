'use client'
import { useEffect, useRef } from 'react'

export type WheelBatch = {
  dx: number
  dy: number
  lastX: number
  lastY: number
  ctrlKey: boolean
  shiftKey: boolean
  altKey: boolean
  metaKey: boolean
}

/**
 * Coalesce wheel events to once per animation frame with accumulated dx/dy.
 * Uses passive: false to allow preventDefault (e.g., to stop page scroll).
 */
export function useRafWheel(
  ref: React.RefObject<HTMLElement | null>,
  onFrame: (sum: WheelBatch) => void,
) {
  const sumRef = useRef<WheelBatch | null>(null)
  const ticking = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const schedule = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        ticking.current = false
        const s = sumRef.current
        if (!s) return
        sumRef.current = null
        onFrame(s)
      })
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      // Normalize delta across devices (pixel/line/page)
      const line = 16
      const dy = e.deltaMode === 1 ? e.deltaY * line : e.deltaMode === 2 ? e.deltaY * (window.innerHeight || 800) : e.deltaY
      const dx = e.deltaMode === 1 ? e.deltaX * line : e.deltaMode === 2 ? e.deltaX * (window.innerWidth  || 1200) : e.deltaX
      const s =
        sumRef.current ??
        (sumRef.current = {
          dx: 0,
          dy: 0,
          lastX: e.clientX,
          lastY: e.clientY,
          ctrlKey: e.ctrlKey,
          shiftKey: e.shiftKey,
          altKey: e.altKey,
          metaKey: e.metaKey,
        })
      s.dx += dx
      s.dy += dy
      s.lastX = e.clientX
      s.lastY = e.clientY
      s.ctrlKey = e.ctrlKey
      s.shiftKey = e.shiftKey
      s.altKey = e.altKey
      s.metaKey = e.metaKey
      schedule()
    }

    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel as any)
  }, [ref, onFrame])
}
