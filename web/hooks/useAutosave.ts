'use client'

import { useEffect } from 'react'
import { useBuilderStore } from '@/store/builderStore'

const storage = {
  get(key: string) {
    if (typeof window === 'undefined') return null
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  set(key: string, val: string) {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(key, val)
    } catch {}
  },
}

const KEY = 'builder:doc'

export function useAutosave() {
  useEffect(() => {
    const saved = storage.get(KEY)
    if (saved && useBuilderStore.getState().elements.length === 0) {
      if (window.confirm('Restore previous session?')) {
        useBuilderStore.getState().hydrate(saved)
      }
    }

    let timer: number | null = null
    const unsub = useBuilderStore.subscribe(
      (s) => s.elements,
      () => {
        if (timer) window.clearTimeout(timer)
        timer = window.setTimeout(() => {
          const json = useBuilderStore.getState().serialize()
          storage.set(KEY, json)
        }, 1500)
      },
    )

    return () => {
      unsub()
      if (timer) window.clearTimeout(timer)
    }
  }, [])
}

