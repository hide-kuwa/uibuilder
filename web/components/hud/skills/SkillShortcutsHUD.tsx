'use client'
import React, {useEffect, useState} from 'react'
import { LIFE_TABLE, ACCOUNTS } from './tools'

export default function SkillShortcutsHUD(){
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  useEffect(()=>{
    const key=(e:KeyboardEvent)=> {
      if((e.ctrlKey||e.metaKey) && e.key.toLowerCase()==='k'){ e.preventDefault(); setOpen(o=>!o) }
    }
    window.addEventListener('keydown', key); return ()=> window.removeEventListener('keydown', key)
  },[])
  const life = LIFE_TABLE.filter(x=> x.keyword.includes(q))
  const acs = ACCOUNTS.filter(a=> a.includes(q))

  return (
    <div className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2">
      <div className={`pointer-events-auto transition-all ${open?'translate-x-0 opacity-100':'translate-x-4 opacity-0 pointer-events-none'}`}>
        <div className="w-80 bg-white/90 backdrop-blur rounded-xl shadow p-3">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="キーワード…" className="w-full border rounded px-2 py-1 text-sm"/>
          <div className="mt-2 text-xs text-gray-600">耐用年数</div>
          {life.map(x=>(
            <button key={x.keyword} className="block w-full text-left text-sm hover:bg-gray-100 px-2 py-1 rounded"
              onClick={()=> window.dispatchEvent(new CustomEvent('skill:paste',{detail:`耐用年数:${x.years}年`}))}>
              {x.keyword} → {x.years}年
            </button>
          ))}
          <div className="mt-2 text-xs text-gray-600">勘定科目</div>
          {acs.map(a=>(
            <button key={a} className="block w-full text-left text-sm hover:bg-gray-100 px-2 py-1 rounded"
              onClick={()=> window.dispatchEvent(new CustomEvent('skill:paste',{detail:a}))}>
              {a}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
