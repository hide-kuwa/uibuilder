'use client'
import React from 'react'
import { useHudStore, type DeviceKind } from '@/store/hudStore'

function IconBtn(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  const { active, className, ...rest } = props
  return (
    <button
      {...rest}
      className={[
        'h-8 px-2 rounded-md border text-xs',
        active ? 'border-zinc-300 bg-white/10' : 'border-zinc-800 bg-zinc-900 hover:bg-white/5',
        'text-zinc-200',
        className ?? '',
      ].join(' ')}
    />
  )
}

export function BuilderHUD() {
  const {
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    device,
    setDevice,
    showGrid,
    toggleGrid,
    showOutline,
    toggleOutline,
    showRulers,
    toggleRulers,
    snapToPixel,
    toggleSnap,
  } = useHudStore()

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey
      if (meta && (e.key === '=' || e.key === '+')) {
        e.preventDefault()
        zoomIn()
      } else if (meta && e.key === '-') {
        e.preventDefault()
        zoomOut()
      } else if (meta && e.key === '0') {
        e.preventDefault()
        resetZoom()
      } else if (!meta && (e.key === 'g' || e.key === 'G')) {
        toggleGrid()
      } else if (!meta && (e.key === 'r' || e.key === 'R')) {
        toggleRulers()
      } else if (!meta && (e.key === 'o' || e.key === 'O')) {
        toggleOutline()
      } else if (!meta && (e.key === 'p' || e.key === 'P')) {
        toggleSnap()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [zoomIn, zoomOut, resetZoom, toggleGrid, toggleRulers, toggleOutline, toggleSnap])

  const DeviceBtn = ({ d, label }: { d: DeviceKind; label: string }) => (
    <IconBtn active={device === d} onClick={() => setDevice(d)}>{label}</IconBtn>
  )

  return (
    <>
      <div className="pointer-events-auto fixed left-1/2 top-2 -translate-x-1/2 z-50 flex items-center gap-1">
        <IconBtn onClick={zoomOut}>−</IconBtn>
        <span className="px-2 text-xs text-zinc-300 tabular-nums">{Math.round(zoom * 100)}%</span>
        <IconBtn onClick={zoomIn}>＋</IconBtn>
        <IconBtn onClick={resetZoom}>100%</IconBtn>
      </div>
      <div className="pointer-events-auto fixed right-2 top-2 z-50 flex items-center gap-1">
        <IconBtn active={showGrid} onClick={toggleGrid} title="Grid (G)">Grid</IconBtn>
        <IconBtn active={showRulers} onClick={toggleRulers} title="Rulers (R)">Rul</IconBtn>
        <IconBtn active={showOutline} onClick={toggleOutline} title="Outline (O)">Out</IconBtn>
        <IconBtn active={snapToPixel} onClick={toggleSnap} title="Snap (P)">Snap</IconBtn>
        <div className="mx-1 w-px h-6 bg-zinc-800" />
        <DeviceBtn d="free" label="Free" />
        <DeviceBtn d="desktop" label="Desktop" />
        <DeviceBtn d="tablet" label="Tablet" />
        <DeviceBtn d="mobile" label="Mobile" />
      </div>
    </>
  )
}
