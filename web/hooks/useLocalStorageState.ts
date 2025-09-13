'use client'
import { useEffect, useRef, useState } from 'react'

export function useLocalStorageState<T>(key: string, initial: T) {
  const isClient = typeof window !== 'undefined'
  const read = () => {
    if (!isClient) return initial
    try {
      const raw = window.localStorage.getItem(key)
      if (!raw) return initial
      return JSON.parse(raw) as T
    } catch {
      return initial
    }
  }
  const [state, setState] = useState<T>(read)
  const prevKey = useRef(key)

  useEffect(() => {
    // Handle key changes
    if (prevKey.current !== key) {
      prevKey.current = key
      setState(read())
    }
    // Subscribe to storage events for cross-tab sync (best-effort)
    const onStorage = (e: StorageEvent) => {
      if (e.storageArea !== window.localStorage) return
      if (e.key !== key) return
      try { setState(e.newValue ? (JSON.parse(e.newValue) as T) : initial) } catch {}
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  useEffect(() => {
    if (!isClient) return
    try { window.localStorage.setItem(key, JSON.stringify(state)) } catch {}
  }, [key, state])

  return [state, setState] as const
}

