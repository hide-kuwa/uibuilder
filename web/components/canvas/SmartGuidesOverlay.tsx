'use client'
import React from 'react'
import type { Guide } from './snap'
export default function SmartGuidesOverlay({guides}:{guides?:Guide[]}) {
  if(!guides?.length) return null
  return (
    <svg className="pointer-events-none absolute inset-0 z-40">
      {guides.map((g,i)=> g.type==='v'
        ? <line key={i} x1={g.pos} x2={g.pos} y1={g.from} y2={g.to} stroke="#ef4444" strokeWidth="1.5"/>
        : <line key={i} y1={g.pos} y2={g.pos} x1={g.from} x2={g.to} stroke="#ef4444" strokeWidth="1.5"/> )}
    </svg>
  )
}
