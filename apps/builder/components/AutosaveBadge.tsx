// apps/builder/components/AutosaveBadge.tsx
'use client'
import React from 'react'

export function AutosaveBadge() {
  const [queued, setQueued] = React.useState(0)
  const onQueued  = (_e: Event) => setQueued((n) => n + 1)
  const onSaved   = (_e: Event) => setQueued((n) => Math.max(0, n - 1))
  const onError   = (_e: Event) => setQueued((n) => n)
  const onOffline = () => setQueued((n) => n)
  const onOnline  = () => setQueued((n) => n)

  React.useEffect(() => {
    window.addEventListener('autosave:queued',  onQueued as any)
    window.addEventListener('autosave:saved',   onSaved as any)
    window.addEventListener('autosave:error',   onError as any)
    window.addEventListener('offline',          onOffline)
    window.addEventListener('online',           onOnline)
    return () => {
      window.removeEventListener('autosave:queued', onQueued as any)
      window.removeEventListener('autosave:saved',  onSaved as any)
      window.removeEventListener('autosave:error',  onError as any)
      window.removeEventListener('offline',         onOffline)
      window.removeEventListener('online',          onOnline)
    }
  }, [])

  const offline = typeof navigator !== 'undefined' && navigator.onLine === false
  return (
    <div style={{
      position:'fixed', right:12, bottom:12, padding:'6px 10px',
      borderRadius:12, background: offline ? '#fee2e2' : (queued>0 ? '#fef9c3' : '#e2fbe2'),
      color:'#111', fontSize:12, boxShadow:'0 1px 4px rgba(0,0,0,0.12)', zIndex:9999
    }}>
      {offline ? 'Offline' : 'Autosave'} {queued>0 ? `• Queue ${queued}` : '• OK'}
    </div>
  )
}

