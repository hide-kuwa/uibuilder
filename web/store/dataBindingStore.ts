'use client'
import { create } from 'zustand'

type Sources = Record<string, any>

type State = { sources: Sources }
type Actions = {
  setSource: (name: string, data: any) => void
  mergeSource: (name: string, data: any) => void
  removeSource: (name: string) => void
  getSource: (name: string) => any
  replaceAll: (s: Sources) => void
}

export const useDataSources = create<State & Actions>((set, get) => ({
  sources: {},
  setSource: (name, data) => set(s => ({ sources: { ...s.sources, [name]: data } })),
  mergeSource: (name, data) => {
    const cur = get().sources[name] || {}
    set(s => ({ sources: { ...s.sources, [name]: deepMerge(cur, data) } }))
  },
  removeSource: (name) => set(s => {
    const n = { ...s.sources }
    delete n[name]
    return { sources: n }
  }),
  getSource: (name) => get().sources[name],
  replaceAll: (s) => set({ sources: s || {} }),
}))

function deepMerge(a: any, b: any): any {
  if (Array.isArray(a) && Array.isArray(b)) return b
  if (a && typeof a === 'object' && b && typeof b === 'object') {
    const out: any = { ...a }
    for (const k of Object.keys(b)) out[k] = deepMerge(a[k], b[k])
    return out
  }
  return b
}

export function getByPath(obj: any, path: string): any {
  if (!path) return obj
  const parts = path.split('.')
  let cur = obj
  for (const p of parts) {
    if (cur == null) return undefined
    cur = cur[p]
  }
  return cur
}

export function listPaths(obj: any, max = 200): string[] {
  const out: string[] = []
  const walk = (o: any, base: string) => {
    if (out.length > max) return
    if (o && typeof o === 'object' && !Array.isArray(o)) {
      for (const k of Object.keys(o)) walk(o[k], base ? base + '.' + k : k)
    } else {
      out.push(base)
    }
  }
  walk(obj, '')
  return out
}
