'use client'
import React, {useEffect, useMemo, useState} from 'react'
import { AR_STEPS } from './steps'

export default function ARGuide(){
  const [idx, setIdx] = useState<number>(()=> Number(localStorage.getItem('uibuilder.arGuide.step')||0))
  const target = useMemo(()=>{
    const sel = AR_STEPS[idx]?.selector
    return sel ? document.querySelector(sel) as HTMLElement|null : null
  },[idx])
  useEffect(()=>{ localStorage.setItem('uibuilder.arGuide.step', String(idx)) },[idx])

  if(!AR_STEPS[idx]) return null
  const rect = target?.getBoundingClientRect()
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-0 bg-black/0" />
      {rect && (
        <div
          className="pointer-events-auto absolute bg-white/90 backdrop-blur rounded-xl shadow p-3 w-72"
          style={{ left: rect.left + rect.width + 8, top: rect.top }}
        >
          <div className="font-medium">{AR_STEPS[idx].title}</div>
          <div className="text-sm text-gray-600">{AR_STEPS[idx].body}</div>
          <div className="mt-2 flex justify-end gap-2">
            <button className="text-xs px-2 py-1" onClick={()=> setIdx(AR_STEPS.length)}>スキップ</button>
            <button className="text-xs px-2 py-1 rounded bg-blue-600 text-white" onClick={()=> setIdx(i=>i+1)}>次へ</button>
          </div>
        </div>
      )}
    </div>
  )
}
