'use client'
import React, { useRef, useState } from 'react'

export default function Viewport({children}:{children:React.ReactNode}) {
  const [scale, setScale] = useState(1)
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [panning, setPanning] = useState(false)
  const [sx, setSx] = useState(0)
  const [sy, setSy] = useState(0)

  const onWheel: React.WheelEventHandler = (e) => {
    if (!e.ctrlKey) return
    e.preventDefault()
    const delta = -e.deltaY * 0.001
    const next = Math.min(2, Math.max(0.25, scale * (1 + delta)))
    const rect = wrapRef.current?.getBoundingClientRect()
    const cx = e.clientX - (rect?.left||0)
    const cy = e.clientY - (rect?.top||0)
    setTx(cx - (cx - tx) * (next / scale))
    setTy(cy - (cy - ty) * (next / scale))
    setScale(next)
  }

  const onMouseDown: React.MouseEventHandler = (e) => {
    if ((e as any).buttons === 1 && (e.nativeEvent as any).buttons === 1 && (e as any).shiftKey === false && (e as any).altKey === false && (e as any).metaKey === false) {
      if (!(e as any).nativeEvent.getModifierState('Space')) return
      setPanning(true); setSx(e.clientX - tx); setSy(e.clientY - ty)
    }
  }
  const onMouseMove: React.MouseEventHandler = (e) => {
    if (!panning) return
    setTx(e.clientX - sx); setTy(e.clientY - sy)
  }
  const onMouseUp = ()=> setPanning(false)

  return (
    <div ref={wrapRef} className="relative h-full w-full overflow-hidden bg-[linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(0deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[length:8px_8px]" onWheel={onWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
      <div className="absolute left-0 top-0 h-6 w-full bg-white/80 backdrop-blur border-b text-[10px] flex items-end">
        <div className="px-2">scale:{(scale*100)|0}%</div>
      </div>
      <div className="absolute top-0 left-0 w-6 h-full bg-white/80 backdrop-blur border-r" />
      <div className="absolute inset-0" style={{ transform:`translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin:'0 0' }}>
        {children}
      </div>
    </div>
  )
}
