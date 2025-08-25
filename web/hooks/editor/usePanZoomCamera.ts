'use client'
import { useEffect, useRef } from 'react'
import type { Camera } from '@/lib/render/tiler'

export function usePanZoomCamera(canvasRef: React.RefObject<HTMLCanvasElement>, onChange: (cam: Camera) => void) {
  const camRef = useRef<Camera>({ x: -512, y: -512, scale: 1 })

  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const cam = camRef.current
    onChange(cam)
    let dragging = false, lastX = 0, lastY = 0
    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.button !== 1 && e.button !== 2) return
      dragging = true; lastX = e.clientX; lastY = e.clientY
      ;(e.target as Element).setPointerCapture?.(e.pointerId)
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = (e.clientX - lastX) / cam.scale
      const dy = (e.clientY - lastY) / cam.scale
      cam.x -= dx; cam.y -= dy; lastX = e.clientX; lastY = e.clientY
      onChange(cam)
    }
    const onPointerUp = () => { dragging = false }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const px = (e.clientX - rect.left) / dpr
      const py = (e.clientY - rect.top) / dpr
      const wx = cam.x + px / cam.scale
      const wy = cam.y + py / cam.scale
      const s = Math.exp(-e.deltaY * 0.001)
      const next = Math.min(8, Math.max(0.2, cam.scale * s))
      cam.x = wx - (px / next); cam.y = wy - (py / next); cam.scale = next
      onChange(cam)
    }
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '0') { cam.x = -512; cam.y = -512; cam.scale = 1; onChange(cam) }
    }
    el.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    el.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    return () => {
      el.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
      el.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
    }
  }, [canvasRef, onChange])

  return camRef
}
