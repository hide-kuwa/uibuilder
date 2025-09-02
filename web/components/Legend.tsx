'use client'
import React from 'react'
export default function Legend({ min, max, steps = 5, format }:{
  min:number; max:number; steps?:number; format?:(v:number)=>string
}) {
  const f = format ?? ((v:number)=>v.toLocaleString())
  const ticks = Array.from({length:steps},(_,i)=>min+((max-min)*i)/(steps-1))
  const gradient = `linear-gradient(to right,
    hsl(210 70% 100%), hsl(210 70% 85%), hsl(210 70% 70%), hsl(210 70% 55%), hsl(210 70% 40%))`
  return (
    <div className="min-w-[200px]">
      <div className="h-3 rounded" style={{ background: gradient }} />
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        {ticks.map((t,i)=><span key={i}>{f(Math.round(t))}</span>)}
      </div>
    </div>
  )
}
