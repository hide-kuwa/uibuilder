import { useState, useEffect } from 'react'
import { useEditorState } from './store'
import LoginDialog from './LoginDialog'

interface Props {
  pageId?: string
}

const BASE = process.env.NEXT_PUBLIC_API_BASE

export default function PublishBar({ pageId = 'home' }: Props) {
  const { tree } = useEditorState()
  const [token, setToken] = useState<string | null>(null)
  const [autoDeploy, setAutoDeploy] = useState(false)
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    const t = localStorage.getItem('token')
    if (t) setToken(t)
  }, [])

  const publish = async () => {
    const t = token || localStorage.getItem('token')
    if (!t) {
      setShowLogin(true)
      return
    }
    try {
      const res = await fetch(`${BASE}/api/pages/${pageId}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`
        },
        body: JSON.stringify({ author: 'demo', json: tree })
      })
      if (res.status === 401) {
        setShowLogin(true)
        return
      }
      if (!res.ok) {
        alert('Publish failed')
        return
      }
      alert('Published')
      window.dispatchEvent(new CustomEvent('exp:tick', { detail: { type: 'publish' } }))
      if (autoDeploy) {
        const res2 = await fetch(`${BASE}/api/pages/${pageId}/deploy`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${t}` }
        })
        if (res2.status === 401) {
          setShowLogin(true)
          return
        }
        if (!res2.ok) {
          alert('Deploy failed')
          return
        }
        alert('Deployed')
      }
    } catch (e) {
      alert('Request error')
    }
  }

  const onLoginSuccess = (tok: string) => {
    setToken(tok)
    setShowLogin(false)
  }

  return (
    <>
      {showLogin && <LoginDialog onClose={() => setShowLogin(false)} onSuccess={onLoginSuccess} />}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={autoDeploy} onChange={e => setAutoDeploy(e.target.checked)} />
          Auto-deploy
        </label>
        <button onClick={publish} className="px-3 py-1 bg-blue-500 text-white rounded">
          Save
        </button>
      </div>
    </>
  )
}
