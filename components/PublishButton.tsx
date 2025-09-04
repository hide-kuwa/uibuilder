'use client'
import React, { useState } from 'react'
import { useEditorState, useEditorActions } from '../src/store'

/**
 * Button that publishes the current editor state to the server.
 */
const PublishButton: React.FC = () => {
  const { tree } = useEditorState()
  const { undo, redo } = useEditorActions()
  const [toast, setToast] = useState(false)
  const [edge, setEdge] = useState<string | null>(null)

  const handlePublish = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      window.location.href = '/login'
      return
    }
    try {
      const res = await fetch('/api/pages/home/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ author: 'demo', json: tree })
      })
      if (!res.ok) {
        alert('Publish failed')
        return
      }
      await res.json()
      localStorage.setItem('ir', JSON.stringify(tree))
      setToast(true)
      setTimeout(() => setToast(false), 2000)

      const edgeRes = await fetch('/edge-config/home')
      if (edgeRes.ok) {
        const txt = await edgeRes.text()
        setEdge(txt)
      }
    } catch {
      alert('Publish error')
    }
  }

  return (
    <div className="flex items-center gap-2 relative">
      <button onClick={undo} className="px-2 py-1 bg-gray-200 rounded">Undo</button>
      <button onClick={redo} className="px-2 py-1 bg-gray-200 rounded">Redo</button>
      <button onClick={handlePublish} className="px-4 py-2 bg-blue-500 text-white rounded">Publish</button>
      {toast && (
        <div className="absolute top-full mt-2 left-0 bg-green-500 text-white px-2 py-1 rounded">
          Published
        </div>
      )}
      {edge && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 max-w-lg w-full">
            <pre className="overflow-auto max-h-96 whitespace-pre-wrap break-words">{edge}</pre>
            <button onClick={() => setEdge(null)} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default PublishButton
