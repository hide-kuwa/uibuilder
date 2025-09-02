'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CODES } from '@/lib/japanPrefs'

/** 0:なし / 1:行きたい / 2:行った / 3:住んだ */
export type PrefState = 0 | 1 | 2 | 3
export const STATES = { none: 0, want: 1, visited: 2, lived: 3 } as const

export type EnumState = Record<string, PrefState>

const packEnum = (s: EnumState) => {
  // 2bit×47 = 94bit → 12byte（96bit）に詰める
  const vals = CODES.map(c => s[c] ?? 0)
  const bytes: number[] = []
  for (let i = 0; i < vals.length; i += 4) {
    const a = vals[i] ?? 0
    const b = vals[i + 1] ?? 0
    const c = vals[i + 2] ?? 0
    const d = vals[i + 3] ?? 0
    bytes.push((a << 6) | (b << 4) | (c << 2) | d)
  }
  const bin = String.fromCharCode(...bytes)
  return btoa(bin) // Base64
}

const unpackEnum = (b64: string): EnumState => {
  try {
    const bin = atob(b64)
    const bytes = Array.from(bin, ch => ch.charCodeAt(0))
    const res: EnumState = {}
    let idx = 0
    for (const byte of bytes) {
      for (let shift = 6; shift >= 0 && idx < CODES.length; shift -= 2) {
        const v = (byte >> shift) & 0b11
        res[CODES[idx]] = v as PrefState
        idx++
      }
      if (idx >= CODES.length) break
    }
    return res
  } catch {
    return {}
  }
}

type Store = {
  painted: EnumState
  cycle: (code: string) => void
  setState: (code: string, v: PrefState) => void
  clearAll: () => void
  fillAll: (v?: PrefState) => void
  exportEnumB64: () => string
  importEnumB64: (b64: string) => void
}

export const usePrefPaintEnum = create(
  persist<Store>(
    (set, get) => ({
      painted: {},
      cycle: (code) =>
        set(s => {
          const cur = s.painted[code] ?? 0
          const next = ((cur + 1) % 4) as PrefState // 0→1→2→3→0
          return { painted: { ...s.painted, [code]: next } }
        }),
      setState: (code, v) => set(s => ({ painted: { ...s.painted, [code]: v } })),
      clearAll: () => set({ painted: {} }),
      fillAll: (v = 2) =>
        set({ painted: Object.fromEntries(CODES.map(c => [c, v])) as EnumState }),
      exportEnumB64: () => packEnum(get().painted),
      importEnumB64: (b64: string) => set({ painted: unpackEnum(b64) }),
    }),
    { name: 'pref-paint-enum-v1' }
  )
)
