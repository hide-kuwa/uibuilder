'use client'
import { useEffect, useRef } from 'react'
import { CanvasTiler, type Camera, type WorldRect } from '@/lib/render/tiler'

export function useCanvasTiler(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  draw: (ctx: CanvasRenderingContext2D, r: WorldRect, cam: Camera, dpr: number) => void,
) {
  const tilerRef = useRef<CanvasTiler | null>(null)
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const tiler = new CanvasTiler(el, { tileSize: 768 })
    tiler.setDraw((ctx, r, cam, dpr) => draw(ctx, r, cam, dpr))
    tilerRef.current = tiler
    const onResizeDpr = () => tiler.setDpr(window.devicePixelRatio || 1)
    onResizeDpr()
    window.addEventListener('resize', onResizeDpr)
    return () => {
      window.removeEventListener('resize', onResizeDpr)
      tiler.destroy()
      tilerRef.current = null
    }
  }, [canvasRef, draw])
  return tilerRef
}
