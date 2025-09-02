'use client'
import React from 'react'
import { useHUD } from './hudStore'
import { useUIStore } from '@/store/uiStore'

export default function HUDBar(){
  const {hud, toggle} = useHUD()
  const { showRulers, toggleRulers } = useUIStore()
  const Btn = ({k,label}:{k:keyof typeof hud,label:string})=> (
    <button
      onClick={(e)=>{ e.stopPropagation(); toggle(k) }}
      className={`pointer-events-auto text-xs px-2 py-1 rounded border ${hud[k]?'bg-blue-600 text-white':'bg-white/80 backdrop-blur'}`}
      title={label}
    >{label}</button>
  )
  return (
    <div className="pointer-events-none absolute right-2 top-2 z-50">
      <div className="pointer-events-auto flex items-center gap-1 p-1 rounded-xl bg-white/70 shadow">
        <Btn k="arGuide" label="ARガイド"/>
        <Btn k="workMap" label="業務マップ"/>
        <Btn k="skillShortcuts" label="スキル"/>
        <Btn k="expGauge" label="EXP"/>
        <Btn k="contextNotify" label="通知"/>
        <label className="flex items-center gap-1 text-xs ml-1">
          <input type="checkbox" checked={showRulers} onChange={toggleRulers} />
          Ruler
        </label>
      </div>
    </div>
  )
}
