'use client'
import { useRef, useState } from 'react'
import { useCanvasStore } from '@/stores/canvas'

type Props = {
  className?: string
  children: React.ReactNode
  hotkeys?: boolean
  onFitRequest?: () => void   // ★ 追加：外からFit実行
}

export default function ZoomPanCanvas({ className, children, hotkeys = true, onFitRequest }: Props) {
  const { scale, tx, ty, setTransform, resetView, snapEnabled } = useCanvasStore()
  const ref = useRef<HTMLDivElement | null>(null)
  const [panning, setPanning] = useState(false)
  const panStart = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null)

  const onWheel: React.WheelEventHandler<HTMLDivElement> = (e) => {
    e.preventDefault()
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    const delta = -e.deltaY
    const factor = Math.exp(delta * 0.0015)
    const newScale = Math.max(0.3, Math.min(3, scale * factor))
    const wx = (mouseX - tx) / scale
    const wy = (mouseY - ty) / scale
    const nTx = mouseX - wx * newScale
    const nTy = mouseY - wy * newScale
    setTransform({ scale: newScale, tx: nTx, ty: nTy })
  }

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!(e.button === 1 || e.buttons === 4 || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey || e.currentTarget === e.target)) return
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

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!hotkeys) return
    if (e.key === '+' || e.key === '=' ) setTransform({ scale: Math.min(3, scale * 1.1) })
    else if (e.key === '-' || e.key === '_') setTransform({ scale: Math.max(0.3, scale / 1.1) })
    else if (e.key === '0') resetView()
  }

  return (
    <div
      ref={ref}
      className={`relative h-[calc(100vh-140px)] touch-none select-none overflow-hidden rounded-2xl border ${className ?? ''}`}
      tabIndex={0}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPan}
      onPointerCancel={endPan}
      onKeyDown={onKeyDown}
      aria-label="zoom-pan-canvas"
      style={{
        cursor: panning ? 'grabbing' : 'default',
        backgroundImage: 'radial-gradient(circle at 25px 25px,#f3f4f6 2px,transparent 0)',
        backgroundSize: snapEnabled ? '50px 50px' : '0 0',
      }}
    >
      <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}>
        {children}
      </div>

      <div className="pointer-events-auto absolute right-3 top-3 flex gap-2">
        <button className="rounded-md border bg-white/90 px-3 py-1 text-sm shadow" onClick={() => useCanvasStore.getState().setTransform({ scale: Math.min(3, scale * 1.1) })}>＋</button>
        <button className="rounded-md border bg-white/90 px-3 py-1 text-sm shadow" onClick={() => useCanvasStore.getState().setTransform({ scale: Math.max(0.3, scale / 1.1) })}>－</button>
        <button className="rounded-md border bg-white/90 px-3 py-1 text-sm shadow" onClick={() => useCanvasStore.getState().resetView()}>リセット</button>
        {!!onFitRequest && (
          <button className="rounded-md border bg-white/90 px-3 py-1 text-sm shadow" onClick={onFitRequest}>Fit</button>
        )}
      </div>
    </div>
  )
}
