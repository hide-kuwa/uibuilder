'use client'
import { useState } from 'react'
import { ensureAuth } from '@/lib/google-drive'

export default function DriveConnect() {
  const [ok, setOk] = useState(false)
  const onClick = async () => {
    try { await ensureAuth(); setOk(true) } catch (e) { alert((e as Error).message) }
  }
  return (
    <button onClick={onClick} className="rounded-md border px-3 py-2 text-sm">
      {ok ? 'Google Drive: Connected' : 'Connect Google Drive'}
    </button>
  )
}
