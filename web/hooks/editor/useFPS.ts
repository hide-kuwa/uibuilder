'use client'
import { useEffect, useRef, useState } from 'react'

export function useFPS() {
  const [fps, setFps] = useState(0)
  const ref = useRef({ last: performance.now(), frames: 0 })
  useEffect(() => {
    let alive = true
    const loop = () => {
      if (!alive) return
      const f = ref.current
      f.frames++
      const now = performance.now()
      if (now - f.last >= 500) {
        setFps(Math.round((f.frames * 1000) / (now - f.last)))
        f.frames = 0; f.last = now
      }
      requestAnimationFrame(loop)
    }
    const id = requestAnimationFrame(loop)
    return () => { alive = false; cancelAnimationFrame(id) }
  }, [])
  return fps
}
