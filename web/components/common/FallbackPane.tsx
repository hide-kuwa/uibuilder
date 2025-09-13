'use client'
import React from 'react'
import { restoreFromLatestStage, getLastCommittedTsSafe } from '@/lib/persist/recover'

export default function FallbackPane({ error }: { error?: Error }) {
  const ts = getLastCommittedTsSafe()
  const ua = typeof navigator !== 'undefined' ? navigator.userAgent : 'n/a'
  const issueUrl = 'https://github.com/hide-kuwa/uibuilder/issues/new'

  return (
    <div className="p-6 space-y-4 text-sm">
      <div className="text-red-600 font-medium">Something went wrong.</div>
      <pre className="bg-neutral-900/60 rounded-lg p-3 overflow-auto">
        {error?.message ?? 'Unknown error'}
      </pre>
      <div className="opacity-80">lastCommittedTs: {ts ?? 'unknown'} / UA: {ua}</div>
      <div className="flex gap-2">
        <button onClick={() => location.reload()} className="btn">Reload</button>
        <button onClick={() => void restoreFromLatestStage()} className="btn">Restore latest snapshot</button>
        <a href={issueUrl} target="_blank" className="btn" rel="noreferrer">Report issue</a>
      </div>
    </div>
  )
}

