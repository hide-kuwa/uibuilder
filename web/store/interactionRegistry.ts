import { create } from 'zustand'
import type { InteractionPreset } from '../types/interactions'

type State = {
  presets: InteractionPreset[]
  selectedId?: string
  add(p: Omit<InteractionPreset,'id'|'updatedAt'> & { id?: string }): string
  update(id: string, patch: Partial<InteractionPreset>): void
  remove(id: string): void
  duplicate(id: string): string | undefined
  select(id?: string): void
  import(json: InteractionPreset[]): void
  export(): string
}

const KEY = 'action-presets-v1'
const uid = () => Math.random().toString(36).slice(2,9)

function load(): InteractionPreset[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}
function save(presets: InteractionPreset[]) {
  try { localStorage.setItem(KEY, JSON.stringify(presets)) } catch {}
}

export const useInteractionRegistry = create<State>((set, get) => ({
  presets: [],
  selectedId: undefined,

  add: (p) => {
    const id = p.id ?? uid()
    const now = Date.now()
    const next = [...get().presets, { ...p, id, updatedAt: now }]
    set({ presets: next, selectedId: id })
    save(next)
    return id
  },

  update: (id, patch) => {
    const next = get().presets.map(x => x.id === id ? { ...x, ...patch, updatedAt: Date.now() } : x)
    set({ presets: next })
    save(next)
  },

  remove: (id) => {
    const next = get().presets.filter(x => x.id !== id)
    set({ presets: next, selectedId: next[0]?.id })
    save(next)
  },

  duplicate: (id) => {
    const src = get().presets.find(x => x.id === id)
    if (!src) return
    const nid = uid()
    const copy = { ...src, id: nid, name: src.name + ' Copy', updatedAt: Date.now() }
    const next = [...get().presets, copy]
    set({ presets: next, selectedId: nid })
    save(next)
    return nid
  },

  select: (id) => set({ selectedId: id }),

  import: (arr) => {
    const next = Array.isArray(arr) ? arr : []
    set({ presets: next, selectedId: next[0]?.id })
    save(next)
  },

  export: () => JSON.stringify(get().presets, null, 2),
}))

// 初回ハイドレーション
if (typeof window !== 'undefined') {
  const init = load()
  if (init?.length) useInteractionRegistry.setState({ presets: init, selectedId: init[0]?.id })
}
