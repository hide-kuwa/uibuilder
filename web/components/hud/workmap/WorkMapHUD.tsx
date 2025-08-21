'use client'
import React, {useEffect, useState} from 'react'
import { STAGES } from './stages'

export default function WorkMapHUD(){
  const [cur, setCur] = useState<string>(()=> localStorage.getItem('uibuilder.workStage') || STAGES[0].id)
  useEffect(()=>{ localStorage.setItem('uibuilder.workStage', cur) },[cur])
  const idx = STAGES.findIndex(s=> s.id===cur)
  const pct = Math.round(((idx+1)/STAGES.length)*100)

  return (
    <div className="pointer-events-none absolute right-2 bottom-2">
      <div className="pointer-events-auto bg-white/80 backdrop-blur rounded-xl shadow p-3 w-64">
        <div className="text-xs text-gray-600 mb-1">業務マップ</div>
        <div className="flex gap-1 flex-wrap">
          {STAGES.map((s,i)=>(
            <div key={s.id} className={`text-xs px-2 py-1 rounded ${i<=idx?'bg-blue-600 text-white':'bg-gray-100'}`}>{s.label}</div>
          ))}
        </div>
        <div className="mt-2 h-1 bg-gray-200 rounded">
          <div className="h-1 bg-blue-600 rounded" style={{width:`${pct}%`}}/>
        </div>
      </div>
    </div>
  )
}
