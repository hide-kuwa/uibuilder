import { create } from 'zustand'
import type { InteractionPreset } from '@/types/interactions'

type State = {
  presets: InteractionPreset[]
  selectedId?: string
  projectDefaultPresetIds: string[]
  setProjectDefaults: (ids: string[]) => void
  add: (p: Omit<InteractionPreset,'id'|'updatedAt'> & { id?: string }) => string
  update: (id: string, patch: Partial<InteractionPreset>) => void
  remove: (id: string) => void
  duplicate: (id: string) => string | undefined
  select: (id?: string) => void
  import: (json: InteractionPreset[]) => void
  export: () => string
}

const KEY = 'action-presets-v1'
const KEY_DEFAULTS = 'action-presets-defaults-v1'
const uid = () => Math.random().toString(36).slice(2,9)

const safeParse = <T,>(raw: string | null, fallback: T): T => {
  try { return raw ? JSON.parse(raw) as T : fallback } catch { return fallback }
}

const loadPresets = (): InteractionPreset[] =>
  typeof window === 'undefined' ? [] : safeParse<InteractionPreset[]>(localStorage.getItem(KEY), [])
const savePresets = (arr: InteractionPreset[]) => { try { localStorage.setItem(KEY, JSON.stringify(arr)) } catch {} }

const loadDefaults = (): string[] =>
  typeof window === 'undefined' ? [] : safeParse<string[]>(localStorage.getItem(KEY_DEFAULTS), [])
const saveDefaults = (ids: string[]) => { try { localStorage.setItem(KEY_DEFAULTS, JSON.stringify(ids)) } catch {} }

export const useInteractionRegistry = create<State>((set, get) => ({
  presets: [],
  selectedId: undefined,
  projectDefaultPresetIds: [],

  setProjectDefaults: (ids) => { set({ projectDefaultPresetIds: ids }); saveDefaults(ids) },

  add: (p) => {
    const id = p.id ?? uid()
    const now = Date.now()
    const next = [...get().presets, { ...p, id, updatedAt: now }]
    set({ presets: next, selectedId: id }); savePresets(next); return id
  },
  update: (id, patch) => {
    const next = get().presets.map(x => x.id===id ? { ...x, ...patch, updatedAt: Date.now() } : x)
    set({ presets: next }); savePresets(next)
  },
  remove: (id) => {
    const next = get().presets.filter(x => x.id !== id)
    set({ presets: next, selectedId: next[0]?.id }); savePresets(next)
  },
  duplicate: (id) => {
    const src = get().presets.find(x => x.id===id); if (!src) return
    const nid = uid(); const copy = { ...src, id: nid, name: src.name + ' Copy', updatedAt: Date.now() }
    const next = [...get().presets, copy]; set({ presets: next, selectedId: nid }); savePresets(next); return nid
  },
  select: (id) => set({ selectedId: id }),
  import: (arr) => { const next = Array.isArray(arr) ? arr : []; set({ presets: next, selectedId: next[0]?.id }); savePresets(next) },
  export: () => JSON.stringify(get().presets, null, 2),
}))

// クライアント初期化＋他タブ同期
if (typeof window !== 'undefined') {
  const presets = loadPresets()
  const defaults = loadDefaults()
  useInteractionRegistry.setState({ presets, selectedId: presets[0]?.id, projectDefaultPresetIds: defaults })

  window.addEventListener('storage', (e) => {
    if (e.key === KEY) useInteractionRegistry.setState({ presets: safeParse(e.newValue, []) })
    if (e.key === KEY_DEFAULTS) useInteractionRegistry.setState({ projectDefaultPresetIds: safeParse(e.newValue, []) })
  })
}
