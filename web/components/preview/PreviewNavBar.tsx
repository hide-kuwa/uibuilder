'use client'
import React from 'react'
import { usePreviewNavStore } from '@/store/previewNavStore'

export default function PreviewNavBar() {
  const back = usePreviewNavStore(s=>s.back)
  const forward = usePreviewNavStore(s=>s.forward)
  const restart = usePreviewNavStore(s=>s.restart)
  const setTransition = usePreviewNavStore(s=>s.setTransition)
  const setDuration = usePreviewNavStore(s=>s.setDuration)
  const kind = usePreviewNavStore(s=>s.defaultTransition)
  const dur = usePreviewNavStore(s=>s.durationMs)
  const canBack = usePreviewNavStore(s=>s.backStack.length>0)
  const canFwd = usePreviewNavStore(s=>s.fwdStack.length>0)
  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-[1000] bg-zinc-900/90 border border-zinc-700 rounded-lg px-2 h-9 flex items-center gap-2">
      <button className="border rounded px-2 h-7 disabled:opacity-50" onClick={restart} disabled={!canBack}>Restart</button>
      <button className="border rounded px-2 h-7 disabled:opacity-50" onClick={back} disabled={!canBack}>Back</button>
      <button className="border rounded px-2 h-7 disabled:opacity-50" onClick={forward} disabled={!canFwd}>Forward</button>
      <select className="ml-2 border rounded h-7 text-sm" value={kind} onChange={(e)=>setTransition(e.target.value as any)}>
        <option value="instant">instant</option>
        <option value="fade">fade</option>
        <option value="slide">slide</option>
      </select>
      <input className="w-16 border rounded h-7 text-xs px-1" type="number" value={dur} onChange={(e)=>setDuration(parseInt(e.target.value||'0',10))} />
      <span className="text-xs opacity-70">ms</span>
    </div>
  )
}
