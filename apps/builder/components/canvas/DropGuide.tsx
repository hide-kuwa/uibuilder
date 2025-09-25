"use client";

import { useEffect, useRef, useState } from 'react'\nimport type { CSSProperties } from 'react'

type GuideType = 'slot' | 'sep'

type GuideRect = { left: number; top: number; width: number; height: number }

type Guide = { rect: GuideRect; type: GuideType }

export default function DropGuide() {
  const [guide, setGuide] = useState<Guide | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const schedule = (next: Guide | null) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => setGuide(next))
    }

    const toRect = (rect: DOMRect): GuideRect => ({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    })

    const handleDragOver = (event: DragEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) {
        schedule(null)
        return
      }
      const separator = target.closest('[data-drop-sep="true"]') as HTMLElement | null
      if (separator) {
        const rect = separator.getBoundingClientRect()
        schedule({ rect: toRect(rect), type: 'sep' })
        return
      }
      const slot = target.closest('[data-slot]') as HTMLElement | null
      if (slot) {
        const rect = slot.getBoundingClientRect()
        schedule({ rect: toRect(rect), type: 'slot' })
        return
      }
      schedule(null)
    }

    const clear = () => schedule(null)

    window.addEventListener('dragover', handleDragOver as any)
    window.addEventListener('dragleave', clear)
    window.addEventListener('drop', clear)
    window.addEventListener('dragend', clear)
    return () => {
      window.removeEventListener('dragover', handleDragOver as any)
      window.removeEventListener('dragleave', clear)
      window.removeEventListener('drop', clear)
      window.removeEventListener('dragend', clear)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  if (!guide) return null

  const style: CSSProperties = {
    position: 'fixed',
    pointerEvents: 'none',
    left: guide.rect.left,
    top: guide.rect.top,
    width: guide.rect.width,
    height: guide.rect.height,
    boxSizing: 'border-box',
    zIndex: 9999,
    border: guide.type === 'sep' ? '2px solid rgba(14, 165, 233, 0.85)' : '2px solid rgba(14, 165, 233, 0.4)',
    borderRadius: guide.type === 'sep' ? 0 : 8,
    backgroundColor: guide.type === 'sep' ? 'rgba(14, 165, 233, 0.08)' : 'rgba(14, 165, 233, 0.05)',
  }

  if (guide.type === 'sep') {
    style.height = Math.max(guide.rect.height, 6)
  }

  return <div style={style} />
}

