'use client'
import { create } from 'zustand'

export type CursorMode = 'default' | 'pointer' | 'move' | 'grab' | 'text'

type CursorState = {
  mode: CursorMode
  setMode: (m: CursorMode) => void
}

const KEY = 'cursor:mode'

function readInitial(): CursorMode {
  if (typeof window === 'undefined') return 'default'
  try {
    const v = window.localStorage.getItem(KEY)
    if (v === 'pointer' || v === 'move' || v === 'grab' || v === 'text' || v === 'default') return v
  } catch {}
  return 'default'
}

export const useCursorStore = create<CursorState>((set, get) => {
  const init = readInitial()
  return {
    mode: init,
    setMode: (m) => {
      try { window.localStorage.setItem(KEY, m) } catch {}
      set({ mode: m })
    },
  }
})

