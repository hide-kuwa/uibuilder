'use client'
import { useRef, useState } from 'react'
import { useCanvasStore } from '@/stores/canvas'

type Props = {
  className?: string
  children: React.ReactNode
  /** キーボード: +/-= でズーム、0でリセット（デフォルトON） */
  hotkeys?: boolean
}

export default function ZoomPanCanvas({ className, children, hotkeys = true }: Props) {
  const { scale, tx, ty, setTransform, resetView } = useCanvasStore()
  const ref = useRef<HTMLDivElement | null>(null)
  const [panning, setPanning] = useState(false)
  const panStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)

  // ホイールでズーム（Ctrl+wheel はOS拡大と衝突しやすいので通常wheelに割当）
  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const delta = -e.deltaY
    const factor = Math.exp(delta * 0.0015) // スムーズ対数ズーム
    const newScale = Math.max(0.3, Math.min(3, scale * factor))

    // ポインタ位置を軸にズーム（世界座標を保つ）
    const wx = (mouseX - tx) / scale
    const wy = (mouseY - ty) / scale
    const nTx = mouseX - wx * newScale
    const nTy = mouseY - wy * newScale

    setTransform({ scale: newScale, tx: nTx, ty: nTy })
  }

  // 背景ドラッグでパン（Space押しながら、または中ボタン）
  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!(e.button === 1 || e.buttons === 4 || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey || e.currentTarget === e.target)) {
      // 背景 or 修飾キーでのみパン開始（子要素ドラッグとは区別）
      return
    }
    e.currentTarget.setPointerCapture(e.pointerId)
    panStart.current = { x: e.clientX, y: e.clientY, tx, ty }
    setPanning(true)
  }
  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!panning || !panStart.current) return
    const dx = e.clientX - panStart.current.x
    const dy = e.clientY - panStart.current.y
    setTransform({ tx: panStart.current.tx + dx, ty: panStart.current.ty + dy })
  }
  const endPan = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!panning) return
    setPanning(false)
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch {}
    panStart.current = null
  }

  // キー操作
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!hotkeys) return
    if (e.key === '+' || e.key === '=') {
      const newScale = Math.min(3, scale * 1.1)
      setTransform({ scale: newScale })
    } else if (e.key === '-' || e.key === '_') {
      const newScale = Math.max(0.3, scale / 1.1)
      setTransform({ scale: newScale })
    } else if (e.key === '0') {
      resetView()
    } else if (e.key === ' ') {
      // Space でパン・カーソル変更
      e.preventDefault()
    }
  }

  return (
    <div
      ref={ref}
      className={`relative h-[calc(100vh-140px)] touch-none select-none overflow-hidden rounded-2xl border bg-[radial-gradient(circle_at_25px_25px,#f3f4f6_2px,transparent_0)] [background-size:50px_50px] ${className ?? ''}`}
      tabIndex={0}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPan}
      onPointerCancel={endPan}
      onKeyDown={onKeyDown}
      aria-label="zoom-pan-canvas"
      style={{ cursor: panning ? 'grabbing' : 'default' }}
    >
      {/* ワールド：ここにノードを置く */}
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}
      >
        {children}
      </div>

      {/* ツールバー */}
      <div className="pointer-events-auto absolute right-3 top-3 flex gap-2">
        <button className="rounded-md border bg-white/90 px-3 py-1 text-sm shadow" onClick={() => setTransform({ scale: Math.min(3, scale * 1.1) })}>＋</button>
        <button className="rounded-md border bg-white/90 px-3 py-1 text-sm shadow" onClick={() => setTransform({ scale: Math.max(0.3, scale / 1.1) })}>－</button>
        <button className="rounded-md border bg-white/90 px-3 py-1 text-sm shadow" onClick={() => resetView()}>リセット</button>
      </div>
    </div>
  )
}
