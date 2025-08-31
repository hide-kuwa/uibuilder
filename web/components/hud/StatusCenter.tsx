'use client'
import React, { useEffect } from 'react'
import { useStatusCenter } from '@/store/statusCenterStore'

export default function StatusCenter() {
  const open = useStatusCenter(s=>s.open)
  const toggle = useStatusCenter(s=>s.toggle)
  const busy = useStatusCenter(s=>s.busy)
  const pr = useStatusCenter(s=>s.pr)
  const runs = useStatusCenter(s=>s.runs)
  const lastPrNumber = useStatusCenter(s=>s.lastPrNumber)
  const lastPrUrl = useStatusCenter(s=>s.lastPrUrl)
  const fetchPr = useStatusCenter(s=>s.fetchPr)
  const fetchRuns = useStatusCenter(s=>s.fetchRuns)

  useEffect(() => {
    if (!open) return
    const t = setInterval(() => {
      if (lastPrNumber) fetchPr(lastPrNumber)
      fetchRuns()
    }, 10000)
    return () => clearInterval(t)
  }, [open, lastPrNumber, fetchPr, fetchRuns])

  if (!open) return null
  return (
    <div className="fixed right-2 top-12 z-[9997] w-[520px] max-h-[70vh] bg-zinc-900/95 border border-zinc-700 rounded-lg overflow-hidden text-sm">
      <div className="h-9 px-2 border-b border-zinc-700 flex items-center gap-2">
        <div className="font-semibold">Status Center</div>
        <div className="ml-auto flex items-center gap-2">
          <button className="border rounded h-7 px-2" onClick={()=>{ if (lastPrNumber) fetchPr(lastPrNumber) }}>Refresh PR</button>
          <button className="border rounded h-7 px-2" onClick={fetchRuns}>Refresh Runs</button>
          <button className="border rounded h-7 px-2" onClick={()=>toggle(false)}>Close</button>
        </div>
      </div>
      <div className="p-3 space-y-3 overflow-auto">
        <div>
          <div className="text-xs opacity-70 mb-1">Pull Request</div>
          {lastPrNumber ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <a className="underline" href={lastPrUrl} target="_blank" rel="noreferrer">PR #{lastPrNumber}</a>
                <span className="text-xs opacity-70">{pr?.state}{pr?.merged ? ' (merged)' : ''}</span>
              </div>
              <div className="text-xs opacity-70">HEAD {pr?.headSha?.slice(0,7)}</div>
              <div className="space-y-1">
                {(pr?.checks||[]).map((c,i)=>(
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-28 truncate">{c.name}</span>
                    <span className="text-xs">{c.status}{c.conclusion ? ` / ${c.conclusion}` : ''}</span>
                    {c.htmlUrl ? <a className="text-xs underline" href={c.htmlUrl} target="_blank" rel="noreferrer">details</a> : null}
                  </div>
                ))}
                {(!pr?.checks || pr.checks.length===0) && <div className="text-xs opacity-70">No checks</div>}
              </div>
            </div>
          ) : (
            <div className="text-xs opacity-70">No PR yet</div>
          )}
        </div>
        <div>
          <div className="text-xs opacity-70 mb-1">Deploy Workflow Runs</div>
          <div className="space-y-1">
            {(runs?.items||[]).map(it=>(
              <div key={it.id} className="flex items-center gap-2">
                <a className="underline" href={it.url} target="_blank" rel="noreferrer">{it.event} #{it.id}</a>
                <span className="text-xs">{it.status}{it.conclusion ? ` / ${it.conclusion}` : ''}</span>
                <span className="text-xs opacity-70">{it.headBranch} {it.headSha.slice(0,7)}</span>
              </div>
            ))}
            {(!runs?.items || runs.items.length===0) && <div className="text-xs opacity-70">No recent runs</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
