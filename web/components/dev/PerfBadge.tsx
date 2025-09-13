'use client'
import React, { useEffect, useRef, useState } from 'react'

export default function PerfBadge() {
  const [fps, setFps] = useState(60)
  const last = useRef(performance.now())
  const acc = useRef<number[]>([])
  useEffect(() => {
    let raf = 0
    const loop = () => {
      const now = performance.now()
      const dt = now - last.current
      last.current = now
      const cur = Math.min(120, 1000 / (dt || 1))
      acc.current.push(cur)
      if (acc.current.length > 30) acc.current.shift()
      const avg = acc.current.reduce((a, b) => a + b, 0) / acc.current.length
      setFps(Math.round(avg))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return (
    <div className="pointer-events-none fixed right-2 bottom-2 z-[999] rounded-md bg-black/60 px-2 py-1 text-xs text-white shadow">
      {fps} fps
    </div>
  )
}

