'use client'
import React from 'react'
import { useEditorStore } from '@/store/editorStore'

export default function SaveIndicator() {
  const pending = useEditorStore((s) => s.pendingVersion)
  const committed = useEditorStore((s) => s.committedVersion)
  const state = useEditorStore((s) => s.commitState)
  const lastAt = useEditorStore((s) => s.lastCommittedAt)
  const err = useEditorStore((s) => s.lastCommitError)

  let label = 'Committed'
  let cls = 'text-emerald-300 border-emerald-600'
  if (state === 'committing') {
    label = 'Committing…'
    cls = 'text-sky-300 border-sky-600'
  } else if (pending > committed) {
    label = 'Pending'
    cls = 'text-amber-300 border-amber-600'
  }
  if (state === 'error') {
    label = 'Error — retrying…'
    cls = 'text-red-300 border-red-600'
  }

  return (
    <div
      className={`px-2 py-1 rounded bg-zinc-900/80 border ${cls} text-xs`}
      title={
        state === 'error'
          ? err ?? 'commit error'
          : lastAt
          ? `Last committed: ${new Date(lastAt).toLocaleString()}`
          : ''
      }
    >
      {label}
    </div>
  )
}
