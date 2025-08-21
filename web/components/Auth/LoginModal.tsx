'use client'
import React, { useState } from 'react'
import { apiFetch, setToken } from '../../lib/api'

type Props = { open: boolean; onClose: () => void; onLoggedIn?: () => void }

const LoginModal: React.FC<Props> = ({ open, onClose, onLoggedIn }) => {
  const [email, setEmail] = useState('demo@example.com')
  const [password, setPassword] = useState('demo')
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  if (!open) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErr(null)
    try {
      const res = await apiFetch<{ access_token: string }>('/auth/login', {
        method: 'POST',
        json: { email, password },
      })
      setToken(res.access_token)
      onLoggedIn?.()
      onClose()
    } catch (e: any) {
      setErr(e.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-4 w-96 space-y-3">
        <div className="text-lg font-semibold">Sign in</div>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <form onSubmit={submit} className="space-y-2">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
          />
          <input
            type="password"
            className="w-full border rounded px-3 py-2"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />
          <button
            className="w-full rounded bg-blue-600 text-white py-2 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <button className="text-sm text-gray-600" onClick={onClose}>Cancel</button>
      </div>
    </div>
  )
}

export default LoginModal

