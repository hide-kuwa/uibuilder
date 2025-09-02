'use client'
import React, { useEffect, useRef } from 'react'

export type Preset = 'pop' | 'fadeUp' | 'cascade'

export default function AnimeOnMount({
  preset = 'pop',
  duration = 700,
  delay = 0,
  stagger = 60,
  easing = 'easeOutQuad',
  selector = '>*',
  playKey = 0,
  children,
  className,
  style,
}: {
  preset?: Preset
  duration?: number
  delay?: number
  stagger?: number
  easing?: string
  selector?: string          // cascade のターゲットセレクタ
  playKey?: number           // 変わると再生し直す
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const mod = await import('animejs')
      if (cancelled) return
      const anime = (mod.default ?? (mod as any)) as any
      const base = { duration, delay, easing }
      const el = ref.current
      if (!el) return
      if (preset === 'cascade') {
        const targets = el.querySelectorAll(selector)
        anime({ targets, opacity: [0, 1], translateY: [8, 0], delay: anime.stagger(stagger), ...base })
      } else if (preset === 'fadeUp') {
        anime({ targets: el, opacity: [0, 1], translateY: [12, 0], ...base })
      } else {
        anime({ targets: el, opacity: [0, 1], scale: [0.96, 1], ...base })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [preset, duration, delay, stagger, easing, selector, playKey])

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  )
}
