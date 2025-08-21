'use client'
import React, { useEffect, useState } from 'react'
import { apiFetch, getToken } from '../lib/api'
import { useEditorActions } from './store'

const PAGE_ID = 'home'

type VersionMeta = { id: string; created_at: string; author?: string }

const VersionsPanel: React.FC = () => {
  const { loadTemplate } = useEditorActions()
  const [items, setItems] = useState<VersionMeta[]>([])
  const [open, setOpen] = useState(true)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const refresh = async () => {
    setLoading(true); setErr(null)
    try {
      const res = await apiFetch<VersionMeta[]>(`/api/pages/${PAGE_ID}/versions`)
      setItems(res)
    } catch (e:any) {
      setErr(e.message || 'failed')
    } finally {
      setLoading(false)
    }
  }

  useEffect(()=>{ refresh() }, [])

  const loadVersion = async (vid: string) => {
    const json = await apiFetch<any>(`/api/pages/${PAGE_ID}/versions/${vid}`)
    const next = Array.isArray(json.children) ? json.children : []
    loadTemplate(next)
  }

  const rollback = async (vid: string) => {
    const token = getToken()
    if (!token) { alert('Login required'); return }
    await apiFetch(`/api/pages/${PAGE_ID}/rollback/${vid}`, { method:'POST' })
    await refresh()
    alert('Rollback created (new head version)')
  }

  return (
    <div className="border-l w-80 h-full flex flex-col">
      <div className="p-2 border-b flex items-center justify-between">
        <div className="font-medium">Versions</div>
        <button className="text-sm text-blue-600" onClick={refresh}>Refresh</button>
      </div>
      {loading && <div className="p-2 text-sm text-gray-500">Loading…</div>}
      {err && <div className="p-2 text-sm text-red-600">{err}</div>}
      <div className="flex-1 overflow-auto">
        {items.map(v => (
          <div key={v.id} className="p-2 border-b space-y-1">
            <div className="text-xs text-gray-500">{new Date(v.created_at).toLocaleString()}</div>
            <div className="text-sm">{v.author ?? '—'}</div>
            <div className="flex gap-2">
              <button className="text-xs px-2 py-1 rounded border" onClick={()=>loadVersion(v.id)}>Load</button>
              <button className="text-xs px-2 py-1 rounded border" onClick={()=>rollback(v.id)}>Rollback</button>
            </div>
          </div>
        ))}
        {items.length === 0 && !loading && <div className="p-2 text-sm text-gray-500">No versions yet</div>}
      </div>
    </div>
  )
}

export default VersionsPanel

