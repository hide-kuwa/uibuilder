'use client'
import React from 'react'
import { useUIAudit } from '@/store/uiAuditStore'

export default function UIAuditPanel() {
  const last = useUIAudit(s=>s.last)
  const busy = useUIAudit(s=>s.busy)
  const run = useUIAudit(s=>s.run)
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button className="border rounded px-2 h-8" onClick={()=>run({width:1200,height:720})} disabled={busy}>{busy?'Running...':'Run audit'}</button>
        {last ? <div className="text-sm">Score: {(last.score*100).toFixed(0)}</div> : null}
      </div>
      {last ? (
        <div className="space-y-2">
          {last.metrics.map(m=>(
            <div key={m.key} className="flex items-center gap-2">
              <div className="w-40 text-xs">{m.key}</div>
              <div className="flex-1 h-2 bg-zinc-800 rounded">
                <div className="h-2 bg-zinc-500 rounded" style={{ width: `${Math.round(m.score*100)}%` }} />
              </div>
              <div className="w-10 text-right text-xs">{Math.round(m.score*100)}</div>
            </div>
          ))}
          <div className="pt-2">
            <div className="text-sm font-semibold mb-1">Issues</div>
            <div className="space-y-1 max-h-48 overflow-auto">
              {last.issues.length===0 ? <div className="text-xs opacity-70">No issues</div> :
                last.issues.map((i,idx)=>(
                  <div key={idx} className="text-xs">
                    <span className={i.level==='error'?'text-red-400':i.level==='warn'?'text-yellow-400':'text-zinc-300'}>[{i.level}]</span> {i.message}{i.nodeId?` (node:${i.nodeId})`:''}
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
