'use client'
import { useEffect, useRef } from 'react'

export function useRafPointerPan(
  ref: React.RefObject<HTMLElement | null>,
  onPan: (dx: number, dy: number) => void,
  opts?: { isActive?: (e: PointerEvent) => boolean }
) {
  const dragging = useRef(false)
  const last = useRef<{ x: number; y: number } | null>(null)
  const sum = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 })
  const ticking = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const flush = () => {
      if (ticking.current) return
      ticking.current = true
      requestAnimationFrame(() => {
        ticking.current = false
        const { dx, dy } = sum.current
        if (dx || dy) {
          sum.current = { dx: 0, dy: 0 }
          onPan(dx, dy)
        }
      })
    }

    const onDown = (e: PointerEvent) => {
      const active = opts?.isActive ? opts.isActive(e) : e.button === 0
      if (!active) return
      dragging.current = true
      last.current = { x: e.clientX, y: e.clientY }
      el.setPointerCapture?.(e.pointerId)
    }
    const onMove = (e: PointerEvent) => {
      if (!dragging.current || !last.current) return
      const dx = e.clientX - last.current.x
      const dy = e.clientY - last.current.y
      last.current = { x: e.clientX, y: e.clientY }
      sum.current.dx += dx
      sum.current.dy += dy
      flush()
    }
    const onUp = (e: PointerEvent) => {
      dragging.current = false
      last.current = null
      el.releasePointerCapture?.(e.pointerId)
    }

    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onUp)
    }
  }, [ref, onPan])
}
