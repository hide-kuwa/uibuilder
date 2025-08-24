'use client'
import React, { useEffect, useRef, useState } from 'react'
import { CanvasTiler, type Camera, type WorldRect } from '@/lib/render/tiler'
import { useEditorStore } from '@/store/editorStore'
import RecoveryPrompt from '@/components/hud/RecoveryPrompt'

/**
 * v13-1: タイル描画ステージ実装（MVP）
 * - 右ドラッグ：パン、ホイール：ズーム（Ctrl+0 でリセット）
 * - タイル化 + OffscreenCanvas によるオーバードロー削減
 * - FPS 簡易表示
 */
export default function CanvasStage() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const tilerRef = useRef<CanvasTiler | null>(null)
  const [fps, setFps] = useState(0)
  const fpsRef = useRef({ last: performance.now(), frames: 0 })
  const tree = useEditorStore((s) => s.tree) // 既存のシーン構造（revには未連動）

  // Tiler 初期化
  useEffect(() => {
    const el = canvasRef.current
    if (!el) return
    const tiler = new CanvasTiler(el, { tileSize: 768 })
    tiler.setDraw((ctx, tileRect, cam, dpr) => {
      drawScene(ctx, tileRect, cam, dpr, tree)
    })
    tilerRef.current = tiler
    const onResizeDpr = () => tiler.setDpr(window.devicePixelRatio || 1)
    onResizeDpr()
    window.addEventListener('resize', onResizeDpr)
    const raf = () => {
      const f = fpsRef.current
      f.frames++
      const now = performance.now()
      if (now - f.last >= 500) {
        setFps(Math.round((f.frames * 1000) / (now - f.last)))
        f.frames = 0
        f.last = now
      }
      requestAnimationFrame(raf)
    }
    const id = requestAnimationFrame(raf)
    return () => {
      window.removeEventListener('resize', onResizeDpr)
      cancelAnimationFrame(id)
      tiler.destroy()
      tilerRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // シーン更新のたびに全タイル無効化（MVP）
  useEffect(() => {
    tilerRef.current?.invalidateAll()
  }, [tree])

  // ====== 入力（パン/ズーム） ======
  useEffect(() => {
    const el = canvasRef.current
    const tiler = tilerRef.current
    if (!el || !tiler) return

    const cam: Camera = { x: -512, y: -512, scale: 1 } // 初期位置（原点を中央寄せ）
    tiler.setCamera(cam)

    let dragging = false
    let lastX = 0
    let lastY = 0

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.button !== 1 && e.button !== 2) return
      dragging = true
      lastX = e.clientX
      lastY = e.clientY
      ;(e.target as Element).setPointerCapture?.(e.pointerId)
    }
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return
      const dx = (e.clientX - lastX) / cam.scale
      const dy = (e.clientY - lastY) / cam.scale
      cam.x -= dx
      cam.y -= dy
      lastX = e.clientX
      lastY = e.clientY
      tiler.setCamera(cam)
    }
    const onPointerUp = (e: PointerEvent) => {
      dragging = false
    }
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const px = (e.clientX - rect.left) / (window.devicePixelRatio || 1)
      const py = (e.clientY - rect.top) / (window.devicePixelRatio || 1)
      const wx = cam.x + px / cam.scale
      const wy = cam.y + py / cam.scale
      const s = Math.exp(-e.deltaY * 0.001) // smooth zoom
      const next = Math.min(8, Math.max(0.2, cam.scale * s))
      cam.x = wx - (px / next)
      cam.y = wy - (py / next)
      cam.scale = next
      tiler.setCamera(cam)
    }
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '0') {
        cam.x = -512; cam.y = -512; cam.scale = 1
        tiler.setCamera(cam)
      }
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
  }, [])

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-950">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {/* HUD: FPS */}
      <div className="absolute top-2 right-2 z-10 text-xs px-2 py-1 rounded bg-zinc-900/80 border border-zinc-700 text-zinc-300">
        FPS: {fps}
      </div>
      <RecoveryPrompt />
      {/* ヒント */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 text-[11px] px-2 py-1 rounded bg-zinc-900/60 border border-zinc-700 text-zinc-400">
        Drag to pan • Wheel to zoom • Ctrl+0 reset
      </div>
    </div>
  )
}

// ====== デモ描画 / 既存レンダラ差し替えポイント ======
function drawScene(
  ctx: CanvasRenderingContext2D,
  tileRect: WorldRect,
  cam: Camera,
  dpr: number,
  tree: any[],
) {
  // 1) 背景グリッド（タイルごと）
  drawGrid(ctx, tileRect)

  // 2) 既存のノードを簡易描画（MVP: frame/text/image の名前のみ）
  try {
    traverse(tree, (n: any) => {
      const t = String(n?.type ?? '')
      const id = n?.id
      const x = Number(n?.style?.left ?? n?.props?.x ?? 0)
      const y = Number(n?.style?.top ?? n?.props?.y ?? 0)
      const w = Number(n?.style?.width ?? n?.props?.w ?? 120)
      const h = Number(n?.style?.height ?? n?.props?.h ?? 60)
      if (!aabbIntersect({ x, y, w, h }, tileRect)) return
      ctx.save()
      ctx.translate(x, y)
      ctx.fillStyle = t === 'frame' ? '#1f2937' : t === 'text' ? '#0ea5e9' : '#334155'
      ctx.strokeStyle = '#475569'
      ctx.lineWidth = 1
      ctx.fillRect(0, 0, w, h)
      ctx.strokeRect(0, 0, w, h)
      ctx.fillStyle = '#e2e8f0'
      ctx.font = '12px ui-sans-serif, system-ui'
      ctx.fillText(`${t}:${n?.name ?? id}`, 6, 16)
      ctx.restore()
    })
  } catch {
    // 失敗しても描画は継続
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, r: WorldRect) {
  const step = 64
  const x0 = Math.floor(r.x / step) * step
  const y0 = Math.floor(r.y / step) * step
  ctx.save()
  ctx.strokeStyle = 'rgba(148,163,184,0.15)'
  ctx.lineWidth = 1
  for (let x = x0; x < r.x + r.w; x += step) {
    ctx.beginPath(); ctx.moveTo(x, r.y); ctx.lineTo(x, r.y + r.h); ctx.stroke()
  }
  for (let y = y0; y < r.y + r.h; y += step) {
    ctx.beginPath(); ctx.moveTo(r.x, y); ctx.lineTo(r.x + r.w, y); ctx.stroke()
  }
  // タイル境界の可視化
  ctx.strokeStyle = 'rgba(14,165,233,0.4)'
  ctx.strokeRect(r.x, r.y, r.w, r.h)
  ctx.restore()
}

function traverse(nodes: any[], fn: (n: any) => void) {
  for (const n of nodes ?? []) {
    fn(n)
    if (n?.children) traverse(n.children, fn)
  }
}
function aabbIntersect(a: WorldRect, b: WorldRect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}
