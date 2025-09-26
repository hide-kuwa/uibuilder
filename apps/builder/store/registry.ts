'use client'
import { create } from 'zustand'
import type { PaletteItem } from '@/lib/registry/types'

type RegistryState = {
  items: PaletteItem[]
  setItems: (items: PaletteItem[]) => void
  ensureHydratedOnce: () => void
  _hydrated?: boolean
}

export const useRegistryStore = create<RegistryState>((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  ensureHydratedOnce: () => {
    if (get()._hydrated) return
    if (typeof window !== 'undefined' && (window as any).__componentRegistry) {
      set({ items: (window as any).__componentRegistry as PaletteItem[], _hydrated: true })
      return
    }
    if (typeof window !== 'undefined') {
      fetch('/api/registry')
        .then(r => r.ok ? r.json() : [])
        .then((arr: PaletteItem[]) => set({ items: Array.isArray(arr) ? arr : [], _hydrated: true }))
        .catch(() => set({ items: [], _hydrated: true }))
    }
  },
}))
