'use client'
import { useEffect, useRef, useState } from 'react'
import { useCanvasStore } from '@/stores/canvas'
import { useRafWheel } from '@/hooks/useRafWheel'
import { useRafPointerPan } from '@/hooks/useRafPointerPan'

type Props = {
  className?: string
  children: React.ReactNode
  hotkeys?: boolean
  onFitRequest?: () => void   // ★ 追加：外からFit実行
}

export default function ZoomPanCanvas({ className, children, hotkeys = true, onFitRequest }: Props) {
  const { scale, tx, ty, setTransform, resetView, snapEnabled } = useCanvasStore()
  const ref = useRef<HTMLDivElement | null>(null)
  const rootRef = ref
  const [panning, setPanning] = useState(false)
  const setCursor = (c?: string) => { const el = ref.current; if (el) el.style.cursor = c ?? '' }
  const panningRef = useRef(false)
  const spaceDownRef = useRef(false)

  // Space 押下で grab、ドラッグ中は grabbing。入力中は無視。
  const isEditable = (t: EventTarget | null) => {
    if (!(t instanceof HTMLElement)) return false
    return t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/i.test(t.tagName)
  }
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || isEditable(e.target)) return
      if (spaceDownRef.current) return // auto-repeat対策
      spaceDownRef.current = true
      if (!panningRef.current) setCursor('grab')
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || isEditable(e.target)) return
      spaceDownRef.current = false
      if (!panningRef.current) setCursor('')
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])

  // rAF-coalesced wheel zoom
  useRafWheel(rootRef, ({ dy, lastX, lastY }) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const mouseX = lastX - rect.left
    const mouseY = lastY - rect.top
    const delta = -dy
    const factor = Math.exp(delta * 0.0015)
    const newScale = Math.max(0.3, Math.min(3, useCanvasStore.getState().scale * factor))
    const { tx: curTx, ty: curTy, scale: curScale } = useCanvasStore.getState()
    const wx = (mouseX - curTx) / curScale
    const wy = (mouseY - curTy) / curScale
    const nTx = mouseX - wx * newScale
    const nTy = mouseY - wy * newScale
    setTransform({ scale: newScale, tx: nTx, ty: nTy })
  })

  // Space+Left or Middle button only
  useRafPointerPan(rootRef, (dx, dy) => {
    const s = useCanvasStore.getState()
    setTransform({ tx: s.tx + dx, ty: s.ty + dy })
  }, {
    isActive: (e) => e.button === 1 || (e.button === 0 && (e as any).getModifierState?.('Space')),
    onActiveChange: (active) => {
      setPanning(active)
      panningRef.current = active
      setCursor(active ? 'grabbing' : (spaceDownRef.current ? 'grab' : ''))
    }
  })

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
      // wheel handled via useRafWheel
      // pointer pan handled via useRafPointerPan
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
