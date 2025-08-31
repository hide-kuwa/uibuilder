'use client'
import React, { useEffect, useState } from 'react'
import { hydrateProjectStores } from '@/lib/project/loaders'

export default function LoadFromGitHubMenu() {
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [projects, setProjects] = useState<string[]>([])
  const [projectId, setProjectId] = useState('')
  const [ref, setRef] = useState('')
  const [prNumber, setPrNumber] = useState<string>('')

  useEffect(() => {
    if (!open) return
    ;(async () => {
      try {
        setBusy(true)
        setMsg('')
        const r = await fetch('/api/gh/list-projects', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ref: ref || undefined }) })
        const j = await r.json()
        if (!r.ok) throw new Error(j?.error || 'failed')
        setProjects(j.items || [])
        if (!projectId && j.items?.length) setProjectId(j.items[0])
      } catch (e: any) {
        setMsg(String(e?.message || e))
      } finally {
        setBusy(false)
      }
    })()
  }, [open, ref])

  async function load() {
    try {
      setBusy(true)
      setMsg('')
      const r = await fetch('/api/gh/load-project', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ projectId, ref: ref || undefined, prNumber: prNumber ? Number(prNumber) : undefined }) })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'failed')
      const p = j.project || {}
      const meta = p.meta || { id: projectId }
      hydrateProjectStores({ ...p, meta })
      setMsg('Loaded')
      setOpen(false)
    } catch (e: any) {
      setMsg(String(e?.message || e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative">
      <button className="border rounded px-2 h-7" onClick={()=>setOpen(v=>!v)} disabled={busy}>{open?'Close':'Load'}</button>
      {open && (
        <div className="absolute right-0 mt-2 z-[1000] w-[360px] bg-zinc-900 border border-zinc-700 rounded p-3 space-y-2">
          <div className="text-sm font-semibold">Load from GitHub</div>
          <label className="block">
            <div className="text-xs opacity-70 mb-1">Project</div>
            <select className="w-full border rounded h-8 px-2 text-sm" value={projectId} onChange={(e)=>setProjectId(e.target.value)}>
              {projects.map(p=><option key={p} value={p}>{p}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <div className="text-xs opacity-70 mb-1">Ref (branch/sha)</div>
              <input className="w-full border rounded h-8 px-2 text-sm" value={ref} onChange={(e)=>setRef(e.target.value)} placeholder="main" />
            </label>
            <label className="block">
              <div className="text-xs opacity-70 mb-1">PR Number</div>
              <input className="w-full border rounded h-8 px-2 text-sm" value={prNumber} onChange={(e)=>setPrNumber(e.target.value)} placeholder="" />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button className="border rounded px-2 h-8" onClick={load} disabled={!projectId || busy}>{busy?'Loading...':'Apply'}</button>
            {msg ? <div className="text-xs opacity-70">{msg}</div> : null}
          </div>
        </div>
      )}
    </div>
  )
}
