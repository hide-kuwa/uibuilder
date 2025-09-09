'use client'
import { useEffect } from 'react'
import { useSaveStore } from '@/stores/saveQueue'

export default function SaveBadge(props: React.HTMLAttributes<HTMLDivElement>) {
  const { offline, queued, lastSavedAt, boot } = useSaveStore()
  useEffect(() => {
    void boot()
  }, [boot])
  const state = offline ? (queued > 0 ? 'offline' : 'offline') : queued > 0 ? 'queued' : lastSavedAt ? 'saved' : 'idle'
  return (
    <div data-state={state} data-outbox={queued} className="text-xs px-2 py-1 rounded border inline-flex items-center gap-2" {...props}>
      <span>{offline ? 'Offline' : 'Online'}</span>
      <span>Queue:{queued}</span>
      {lastSavedAt ? <span>{new Date(lastSavedAt).toLocaleTimeString()}</span> : null}
    </div>
  )
}
