'use client'
import React from 'react'
import { useViewport } from './ViewportStore'
export default function GridOverlay(){
  const {vp} = useViewport()
  if(!vp.showGrid) return null
  const size = 8 * vp.zoom
  const bg = `linear-gradient(to right, rgba(0,0,0,.06) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,.06) 1px, transparent 1px)`
  return (
    <div className="pointer-events-none absolute inset-0" style={{
      backgroundImage:bg, backgroundSize:`${size}px ${size}px`,
      transform:`translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})`,
      transformOrigin:'0 0'
    }}/>
  )
}
