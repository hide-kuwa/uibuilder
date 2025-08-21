'use client'
import React, {useEffect, useState} from 'react'
import { getTodayExpTotal, addExp } from './expStore'

export default function ExpGaugeHUD(){
  const [n, setN] = useState(0)
  useEffect(()=>{
    const onTick = (e:any)=>{ addExp(e.detail?.type||'other'); setN(getTodayExpTotal()) }
    window.addEventListener('exp:tick', onTick as any); setN(getTodayExpTotal())
    return ()=> window.removeEventListener('exp:tick', onTick as any)
  },[])
  const pct = Math.min(100, Math.round((n/20)*100))
  return (
    <div className="pointer-events-none absolute right-2 top-14">
      <div className="pointer-events-auto bg-white/80 backdrop-blur rounded-full w-16 h-16 grid place-items-center shadow relative overflow-hidden">
        <div className="text-xs font-semibold z-10">{n}</div>
        <div className="absolute inset-0 rounded-full" style={{background: `conic-gradient(#2563eb ${pct*3.6}deg, transparent 0)`}}/>
      </div>
    </div>
  )
}
