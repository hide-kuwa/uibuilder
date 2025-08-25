'use client'
import React, { useMemo, useRef } from 'react'
import { useEditorStore } from '@/store/editorStore'
import RecoveryPrompt from '@/components/hud/RecoveryPrompt'
import SaveIndicator from '@/components/hud/SaveIndicator'
import { updateHitIndex, pickAt } from '@/lib/vector/hitTest'
import { useFPS } from '@/hooks/editor/useFPS'
import { useCanvasTiler } from '@/hooks/editor/useCanvasTiler'
import { usePanZoomCamera } from '@/hooks/editor/usePanZoomCamera'
import { drawScene } from '@/lib/render/drawScene'

export default function CanvasStage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const fps = useFPS()
  const tree = useEditorStore((s) => s.tree)

  // tiler（描画）とヒットインデックス
  const draw = useMemo(
    () => (ctx: CanvasRenderingContext2D, r: any, cam: any, dpr: number) => drawScene(ctx, r, cam, dpr, tree),
    [tree],
  )
  const tilerRef = useCanvasTiler(canvasRef, draw)
  React.useEffect(() => updateHitIndex(tree), [tree])

  // カメラ（パン / ズーム）
  usePanZoomCamera(canvasRef, (cam) => tilerRef.current?.setCamera(cam))

  // クリック選択（MVP）
  React.useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const onPointerUp = (e: PointerEvent) => {
      if (e.button !== 0) return
      const rect = el.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      const px = (e.clientX - rect.left) / dpr
      const py = (e.clientY - rect.top) / dpr
      // 現在のカメラは tiler が保持しているので、暫定で store から選択のみ
      const state: any = (tilerRef.current as any)
      const cam = state?._cam || { x: -512, y: -512, scale: 1 }
      const wx = cam.x + px / cam.scale
      const wy = cam.y + py / cam.scale
      const id = pickAt(wx, wy)
      if (id) { try { useEditorStore.getState().select([id]) } catch {} }
    }
    el.addEventListener('pointerup', onPointerUp)
    return () => el.removeEventListener('pointerup', onPointerUp)
  }, [tilerRef])

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-2 right-2 z-10 text-xs px-2 py-1 rounded bg-zinc-900/80 border border-zinc-700 text-zinc-300">
        FPS: {fps}
      </div>
      <div className="absolute top-2 left-2 z-10">
        <SaveIndicator />
      </div>
      <RecoveryPrompt />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 text-[11px] px-2 py-1 rounded bg-zinc-900/60 border border-zinc-700 text-zinc-400">
        Drag to pan • Wheel to zoom • Ctrl+0 reset
      </div>
    </div>
  )
}
