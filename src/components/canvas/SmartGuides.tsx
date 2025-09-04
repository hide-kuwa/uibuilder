'use client'
import React from 'react'

export type SmartGuide = { axis: 'x' | 'y'; pos: number }

/**
 * Renders smart alignment guides for the canvas. Guides are updated through
 * a custom `smart-guides` event so that heavy drag events can batch updates via
 * `requestAnimationFrame`.
 */
export default function SmartGuides() {
  const [enabled, setEnabled] = React.useState(true)
  const [guides, setGuides] = React.useState<SmartGuide[]>([])
  const rafRef = React.useRef<number | null>(null)

  // Listen for external updates. Other modules can dispatch
  // `window.dispatchEvent(new CustomEvent('smart-guides', { detail: guides }))`
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<SmartGuide[]>).detail
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => setGuides(detail || []))
    }
    window.addEventListener('smart-guides', handler as any)
    return () => window.removeEventListener('smart-guides', handler as any)
  }, [])

  // Toggle with Ctrl+G / Cmd+G
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'g') {
        e.preventDefault()
        setEnabled(prev => !prev)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  if (!enabled || guides.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-0">
      {guides.map((g, i) =>
        g.axis === 'x' ? (
          <div
            key={i}
            className="absolute bg-blue-500/60"
            style={{ left: g.pos, top: 0, width: 1, height: '100%' }}
          />
        ) : (
          <div
            key={i}
            className="absolute bg-blue-500/60"
            style={{ top: g.pos, left: 0, height: 1, width: '100%' }}
          />
        )
      )}
    </div>
  )
}

// Helper to broadcast guides to the overlay.
export function updateSmartGuides(guides: SmartGuide[]) {
  window.dispatchEvent(new CustomEvent<SmartGuide[]>('smart-guides', { detail: guides }))
}
