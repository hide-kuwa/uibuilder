import React, { useState } from 'react'
import { useEditorState, useEditorActions } from '../src/store'

const Header: React.FC = () => {
  const { tree } = useEditorState()
  const { undo, redo } = useEditorActions()
  const [toast, setToast] = useState(false)

  const handlePublish = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/pages/home/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ author: 'demo', json: tree })
      })
      if (!res.ok) return
      await res.json()
      localStorage.setItem('ir', JSON.stringify(tree))
      setToast(true)
      setTimeout(() => setToast(false), 2000)
    } catch {}
  }

  return (
    <div className="flex items-center gap-2 relative">
      <button onClick={undo} className="px-2 py-1 bg-gray-200 rounded">Undo</button>
      <button onClick={redo} className="px-2 py-1 bg-gray-200 rounded">Redo</button>
      <button onClick={handlePublish} className="px-4 py-2 bg-blue-500 text-white rounded">Publish</button>
      {toast && <div className="absolute top-full mt-2 left-0 bg-green-500 text-white px-2 py-1 rounded">Published</div>}
    </div>
  )
}

export default Header
