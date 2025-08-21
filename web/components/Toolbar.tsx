'use client'
import React, { useState } from 'react'
import { useEditorState, useEditorActions } from './store'
import { apiFetch, getToken, clearToken } from '../lib/api'
import LoginModal from './Auth/LoginModal'

const PAGE_ID = 'home'

const Toolbar: React.FC = () => {
  const { tree } = useEditorState()
  const { loadTemplate } = useEditorActions()
  const [loginOpen, setLoginOpen] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const show = (m: string) => { setMsg(m); setTimeout(()=>setMsg(null), 2500) }

  const publish = async () => {
    const token = getToken()
    if (!token) { setLoginOpen(true); return }
    const payload = {
      author: 'web',
      json: { id:'root', type:'div', children: tree }
    }
    await apiFetch(`/api/pages/${PAGE_ID}/publish`, { method:'POST', json: payload })
    show('Published ✅')
  }

  const deploy = async () => {
    const token = getToken()
    if (!token) { setLoginOpen(true); return }
    await apiFetch(`/api/pages/${PAGE_ID}/deploy`, { method:'POST' })
    show('Deployed to KV ✅')
  }

  const loadLatest = async () => {
    const data = await apiFetch(`/edge-config/${PAGE_ID}`)
    // data = {id:'root', type:'div', children:[...]} or children がない場合もあり得る
    const root = data as any
    const next = Array.isArray(root.children) ? root.children : []
    loadTemplate(next)
    show('Loaded from Edge ✅')
  }

  const logout = () => { clearToken(); show('Logged out') }

  return (
    <>
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
        <div className="flex items-center gap-2 p-2">
          <button className="px-3 py-1 rounded border" onClick={()=>setLoginOpen(true)}>Login</button>
          <button className="px-3 py-1 rounded border" onClick={logout}>Logout</button>
          <div className="mx-2 w-px h-6 bg-gray-200" />
          <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={publish}>Publish</button>
          <button className="px-3 py-1 rounded bg-emerald-600 text-white" onClick={deploy}>Deploy</button>
          <button className="px-3 py-1 rounded border" onClick={loadLatest}>Load (Edge)</button>
          {msg && <span className="text-sm text-gray-600 ml-2">{msg}</span>}
        </div>
      </div>
      <LoginModal open={loginOpen} onClose={()=>setLoginOpen(false)} onLoggedIn={()=>show('Logged in ✅')} />
    </>
  )
}

export default Toolbar

