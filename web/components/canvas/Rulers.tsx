'use client'
import React from 'react'
import { useViewport } from './ViewportStore'
export default function Rulers(){
  const {vp} = useViewport()
  if(!vp.showRulers) return null
  const size = 50 * vp.zoom
  return (
    <>
      <div className="pointer-events-none absolute top-0 left-0 h-6 w-full bg-white/80 border-b" style={{
        backgroundImage:'linear-gradient(to right, rgba(0,0,0,0.2) 1px, transparent 1px)',
        backgroundSize:`${size}px 100%`,
        transform:`translate(${vp.x}px,0)`,
        transformOrigin:'0 0'
      }}/>
      <div className="pointer-events-none absolute top-0 left-0 w-6 h-full bg-white/80 border-r" style={{
        backgroundImage:'linear-gradient(to bottom, rgba(0,0,0,0.2) 1px, transparent 1px)',
        backgroundSize:`100% ${size}px`,
        transform:`translate(0,${vp.y}px)`,
        transformOrigin:'0 0'
      }}/>
    </>
  )
}
