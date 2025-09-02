'use client'
import React, { useEffect, useRef, useState } from 'react'
import AnimeOnMount, { type Preset } from './AnimeOnMount'

export default function AnimeOnView({
  preset = 'fadeUp',
  rootMargin = '0px 0px -10% 0px',
  once = true,
  ...rest
}: {
  preset?: Preset
  rootMargin?: string
  once?: boolean
  duration?: number
  delay?: number
  stagger?: number
  easing?: string
  selector?: string
  playKey?: number
  className?: string
  children: React.ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setVisible(true)
        if (once) io.disconnect()
      }
    }, { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin, once])
  return (
    <div ref={ref}>
      {visible ? <AnimeOnMount preset={preset} {...rest} /> : rest.children}
    </div>
  )
}
