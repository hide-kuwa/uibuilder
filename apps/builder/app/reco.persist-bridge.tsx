// apps/builder/app/reco.persist-bridge.tsx
'use client'
import React from 'react'

const KEY = 'reco.confirmed'

function load(): any[] {
  try { return JSON.parse(sessionStorage.getItem(KEY) || '[]') } catch { return [] }
}
function save(arr: any[]) {
  try { sessionStorage.setItem(KEY, JSON.stringify(arr)) } catch {}
}

export default function RecoPersistBridge() {
  React.useEffect(() => {
    const onConfirmed = (e: Event) => {
      const detail = (e as CustomEvent)?.detail as any
      if (!detail || !detail.leftId || !detail.rightId) return
      const arr = load()
      arr.unshift({ t: new Date().toISOString(), ...detail })
      save(arr.slice(0, 200))
    }

    const h1 = (ev: any) => onConfirmed(ev)
    const h2 = (ev: any) => onConfirmed(ev)
    window.addEventListener('reco', h1 as any)
    window.addEventListener('reco:confirmed', h2 as any)
    return () => {
      window.removeEventListener('reco', h1 as any)
      window.removeEventListener('reco:confirmed', h2 as any)
    }
  }, [])

  return null
}

