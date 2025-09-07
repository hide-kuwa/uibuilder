// apps/builder/src/hooks/useAutosave.ts
'use client'
import React from 'react'
import { set as idbSet, get as idbGet, del as idbDel, keys as idbKeys } from 'idb-keyval'

type SaveFn<T> = (data: T) => Promise<void>

export type AutosaveOptions<T> = {
  key: string
  data: T
  save: SaveFn<T>
  debounceMs?: number
  enabled?: boolean
}

const QKEY = 'autosave:queue'

async function enqueue<T>(key: string, data: T) {
  await idbSet(`${QKEY}:${key}`, { at: Date.now(), data })
  try { window.dispatchEvent(new CustomEvent('autosave:queued', { detail: { key } })) } catch {}
}

async function dequeue(key: string) {
  await idbDel(`${QKEY}:${key}`)
}

async function flushQueue<T>(save: SaveFn<T>) {
  const allKeys = await idbKeys()
  const qkeys = (allKeys as any[]).map(String).filter(k => k.startsWith(`${QKEY}:`)) as string[]
  for (const k of qkeys) {
    const item = await idbGet(k) as { at: number; data: T } | undefined
    if (!item) continue
    try {
      await save(item.data)
      await idbDel(k)
      try { window.dispatchEvent(new CustomEvent('autosave:saved', { detail: { key: k } })) } catch {}
    } catch {
      try { window.dispatchEvent(new CustomEvent('autosave:error', { detail: { key: k } })) } catch {}
    }
  }
}

export function useAutosave<T>({ key, data, save, debounceMs = 600, enabled = true }: AutosaveOptions<T>) {
  const latest = React.useRef<T>(data)
  latest.current = data

  React.useEffect(() => {
    if (!enabled) return
    const h = setTimeout(async () => {
      try {
        await save(latest.current)
        await dequeue(key)
        try { window.dispatchEvent(new CustomEvent('autosave:saved', { detail: { key } })) } catch {}
      } catch {
        await enqueue(key, latest.current)
      }
    }, debounceMs)
    return () => clearTimeout(h)
  }, [key, enabled, debounceMs, save, latest.current])

  React.useEffect(() => {
    if (!enabled) return
    const onOnline = () => { flushQueue(save).catch(()=>{}) }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [enabled, save])

  React.useEffect(() => {
    if (!enabled) return
    flushQueue(save).catch(()=>{})
  }, [enabled, save])
}

