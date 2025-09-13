'use client'
import { useEffect, useRef } from 'react'
import { rafBatch } from '@/lib/perf/rafBatch'

export function useRafPointerMove(
  ref: React.RefObject<HTMLElement | null>,
  onMove: (ev: PointerEvent) => void
) {
  const handlerRef = useRef(onMove)
  handlerRef.current = onMove

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let lastId: number | undefined
    const batched = rafBatch((e: PointerEvent) => handlerRef.current(e))

    const onPointerMove = (e: PointerEvent) => batched(e)
    const onPointerUp = () => {
      if (lastId != null) {
        try { el.releasePointerCapture(lastId) } catch {}
        lastId = undefined
      }
    }
    const onPointerDown = (e: PointerEvent) => {
      if (!el.hasPointerCapture?.(e.pointerId)) {
        try { el.setPointerCapture?.(e.pointerId); lastId = e.pointerId } catch {}
      }
    }

    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onPointerMove)
    el.addEventListener('pointerup', onPointerUp)
    el.addEventListener('pointercancel', onPointerUp)
    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('pointercancel', onPointerUp)
    }
  }, [ref])
}

