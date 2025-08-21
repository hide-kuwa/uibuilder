import { useState } from 'react'

interface Props {
  onClose: () => void
  onSuccess: (token: string) => void
}

const BASE = process.env.NEXT_PUBLIC_API_BASE

export default function LoginDialog({ onClose, onSuccess }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        alert('Login failed')
        return
      }
      const data = await res.json()
      localStorage.setItem('token', data.access_token)
      onSuccess(data.access_token)
      onClose()
    } catch (e) {
      alert('Login error')
    }
  }
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form onSubmit={submit} className="bg-white p-4 rounded flex flex-col gap-2 min-w-[240px]">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          className="border p-2"
        />
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          className="border p-2"
        />
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={onClose} className="px-3 py-1 border rounded">
            Cancel
          </button>
          <button type="submit" className="px-3 py-1 bg-blue-500 text-white rounded">
            Login
          </button>
        </div>
      </form>
    </div>
  )
}
