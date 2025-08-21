'use client'
import React, { useRef, useState } from 'react'
import { useViewport } from './ViewportStore'

export default function Viewport({children}:{children:React.ReactNode}) {
  const { vp, setZoom, panBy } = useViewport()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [panning, setPanning] = useState(false)
  const [sx, setSx] = useState(0)
  const [sy, setSy] = useState(0)

  const onWheel: React.WheelEventHandler = (e) => {
    if (!e.ctrlKey) return
    e.preventDefault()
    const delta = -e.deltaY * 0.001
    const next = Math.min(4, Math.max(0.25, vp.zoom * (1 + delta)))
    const rect = wrapRef.current?.getBoundingClientRect()
    const cx = e.clientX - (rect?.left||0)
    const cy = e.clientY - (rect?.top||0)
    const nx = cx - (cx - vp.x) * (next / vp.zoom)
    const ny = cy - (cy - vp.y) * (next / vp.zoom)
    panBy(nx - vp.x, ny - vp.y)
    setZoom(next)
  }

  const onMouseDown: React.MouseEventHandler = (e) => {
    if (e.button === 1 || (e.button === 0 && (e.nativeEvent as any).getModifierState('Space'))) {
      e.preventDefault()
      setPanning(true); setSx(e.clientX - vp.x); setSy(e.clientY - vp.y)
    }
  }
  const onMouseMove: React.MouseEventHandler = (e) => {
    if (!panning) return
    const nx = e.clientX - sx
    const ny = e.clientY - sy
    panBy(nx - vp.x, ny - vp.y)
  }
  const onMouseUp = ()=> setPanning(false)

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden" onWheel={onWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
      <div className="absolute inset-0" style={{ transform:`translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})`, transformOrigin:'0 0' }}>
        {children}
      </div>
    </div>
  )
}
