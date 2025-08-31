'use client'
import React, { useEffect } from 'react'
import { useDevLogStore } from '@/store/devLogStore'
import { installConsoleInterceptor } from '@/lib/consoleInterceptor'

export default function DevConsoleHUD() {
  const logs = useDevLogStore(s=>s.logs)
  const paused = useDevLogStore(s=>s.paused)
  const level = useDevLogStore(s=>s.level)
  const clear = useDevLogStore(s=>s.clear)
  const setPaused = useDevLogStore(s=>s.setPaused)
  const setLevel = useDevLogStore(s=>s.setLevel)
  useEffect(()=>{ installConsoleInterceptor() },[])
  const filtered = level==='all' ? logs : logs.filter(l=>l.level===level)
  return (
    <div className="fixed right-2 bottom-2 z-[9998] w-[420px] max-h-[50vh] bg-zinc-900/90 border border-zinc-700 rounded-lg overflow-hidden text-xs">
      <div className="h-8 px-2 border-b border-zinc-700 flex items-center gap-2">
        <span className="font-semibold">Dev Console</span>
        <select className="ml-auto border rounded h-6 px-1" value={level} onChange={(e)=>setLevel(e.target.value as any)}>
          <option value="all">all</option>
          <option value="log">log</option>
          <option value="warn">warn</option>
          <option value="error">error</option>
        </select>
        <button className={`border rounded h-6 px-2 ${paused?'bg-zinc-700':''}`} onClick={()=>setPaused(!paused)}>{paused?'Resume':'Pause'}</button>
        <button className="border rounded h-6 px-2" onClick={clear}>Clear</button>
      </div>
      <div className="p-2 space-y-1 overflow-auto">
        {filtered.length===0 ? <div className="text-zinc-400">No logs</div> : filtered.map(l=>(
          <div key={l.id} className={l.level==='error'?'text-red-400':l.level==='warn'?'text-yellow-300':'text-zinc-200'}>
            <span className="opacity-60 mr-1">{new Date(l.ts).toLocaleTimeString()}</span>
            <span className="uppercase mr-1">{l.level}</span>
            <span>{l.msg}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

