'use client'
import React, { useState } from 'react'
import { useBuilderStore } from '@/store/builderStore'
import { useStatusCenter } from '@/store/statusCenterStore'

export default function ReflectDeployMenu() {
  const state = useBuilderStore(s => ({ elements: s.elements, meta: (s as any).meta || { id: 'local', name: 'Local Project' } }))
  const [busy, setBusy] = useState<'reflect'|'deploy'|null>(null)
  const [msg, setMsg] = useState<string>('')
  const setLastPr = useStatusCenter(s=>s.setLastPr)
  const toggle = useStatusCenter(s=>s.toggle)

  async function reflect() {
    try {
      setBusy('reflect')
      setMsg('')
      const res = await fetch('/api/gh/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: state.meta.id || 'project', project: { schemaVersion: 1, meta: state.meta, elements: state.elements, designTokens: {}, assets: [] } }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'reflect failed')
      setMsg(j.prUrl || 'PR created')
      if (j.prNumber) setLastPr(j.prNumber, j.prUrl)
      toggle(true)
    } catch (e: any) {
      setMsg(String(e?.message || e))
    } finally {
      setBusy(null)
    }
  }

  async function deploy() {
    try {
      setBusy('deploy')
      setMsg('')
      const res = await fetch('/api/gh/deploy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'deploy failed')
      setMsg('Deploy started')
      toggle(true)
    } catch (e: any) {
      setMsg(String(e?.message || e))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button className="border rounded px-2 h-7 disabled:opacity-50" disabled={busy!==null} onClick={reflect}>{busy==='reflect'?'Reflecting...':'Reflect'}</button>
      <button className="border rounded px-2 h-7 disabled:opacity-50" disabled={busy!==null} onClick={deploy}>{busy==='deploy'?'Deploying...':'Deploy'}</button>
      {msg ? <a className="text-xs underline" href={msg.startsWith('http')?msg:undefined} target="_blank" rel="noreferrer">{msg}</a> : null}
    </div>
  )
}
