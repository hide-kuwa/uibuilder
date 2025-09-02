'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CODES } from '@/lib/japanPrefs'

type PaintState = Record<string, boolean>

const pack = (state: PaintState) => {
  // 47bitをバイト配列に
  const bits = CODES.map(c => (state[c] ? 1 : 0))
  const bytes: number[] = []
  for (let i = 0; i < bits.length; i += 8) {
    let b = 0
    for (let j = 0; j < 8 && i + j < bits.length; j++) b |= bits[i + j] << (7 - j)
    bytes.push(b)
  }
  const bin = String.fromCharCode(...bytes)
  return btoa(bin) // Base64
}

const unpack = (b64: string): PaintState => {
  try {
    const bin = atob(b64)
    const bytes = Array.from(bin, ch => ch.charCodeAt(0))
    const res: PaintState = {}
    let idx = 0
    for (let i = 0; i < bytes.length && idx < CODES.length; i++) {
      const byte = bytes[i]
      for (let bit = 7; bit >= 0 && idx < CODES.length; bit--) {
        res[CODES[idx]] = ((byte >> bit) & 1) === 1
        idx++
      }
    }
    return res
  } catch { return {} }
}

type Store = {
  painted: PaintState
  toggle: (code: string) => void
  set: (code: string, v: boolean) => void
  clearAll: () => void
  fillAll: () => void
  exportB64: () => string
  importB64: (b64: string) => void
}

export const usePrefPaint = create(
  persist<Store>(
    (set, get) => ({
      painted: {},
      toggle: (code) => set(s => ({ painted: { ...s.painted, [code]: !s.painted[code] } })),
      set: (code, v) => set(s => ({ painted: { ...s.painted, [code]: v } })),
      clearAll: () => set({ painted: {} }),
      fillAll: () => set({ painted: Object.fromEntries(CODES.map(c => [c, true])) }),
      exportB64: () => pack(get().painted),
      importB64: (b64: string) => set({ painted: unpack(b64) }),
    }),
    { name: 'pref-paint-v1' }
  )
)
