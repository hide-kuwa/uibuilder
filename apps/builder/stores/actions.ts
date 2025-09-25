'use client'

import { create } from 'zustand'
import type { ActionPreset, BehaviorTrigger, Effect, Trigger } from '@/lib/actions/types'
import { defaultEffect } from '@/lib/actions/types'

type ActionsStore = {
  list: string[]
  presets: Record<string, ActionPreset>
  currentId?: string
  createPreset: () => string
  duplicate: (id: string) => string
  update: (id: string, patch: Partial<ActionPreset>) => void
  remove: (id: string) => void
  setCurrent: (id?: string) => void
  import: (json: ActionPreset[]) => void
  export: (ids?: string[]) => string
}

const visualTriggers: Trigger[] = ['hover', 'active', 'focus', 'focusWithin', 'groupHover']
const behaviorTriggers: BehaviorTrigger[] = ['click', 'doubleClick', 'mount', 'delay', 'inView']

const cursorKinds: Effect & { kind: 'cursor' }['value'][] = [
  'default',
  'pointer',
  'move',
  'grab',
  'text',
]

const shadowKinds: Effect & { kind: 'shadow' }['value'][] = ['sm', 'md', 'lg', 'xl']

const newId = () => `ap_${Math.random().toString(36).slice(2, 9)}`

const clone = <T,>(value: T): T => {
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value))
  }
}

const sanitizeTriggers = (input: any): Trigger[] => {
  if (!Array.isArray(input)) return []
  const uniq = new Set<Trigger>()
  input.forEach((item) => {
    if (visualTriggers.includes(item as Trigger)) {
      uniq.add(item as Trigger)
    }
  })
  return Array.from(uniq)
}

const sanitizeBehavior = (input: any): BehaviorTrigger[] => {
  if (!Array.isArray(input)) return []
  const uniq = new Set<BehaviorTrigger>()
  input.forEach((item) => {
    if (behaviorTriggers.includes(item as BehaviorTrigger)) uniq.add(item as BehaviorTrigger)
  })
  return Array.from(uniq)
}

const sanitizeTags = (input: any): string[] => {
  if (!Array.isArray(input)) return []
  const uniq = new Set<string>()
  input.forEach((item) => {
    if (typeof item === 'string' && item.trim()) uniq.add(item.trim())
  })
  return Array.from(uniq)
}

const sanitizeEffect = (input: any): Effect | undefined => {
  if (!input || typeof input !== 'object') return undefined
  const kind = input.kind
  switch (kind) {
    case 'bgColor':
    case 'textColor':
    case 'borderColor':
      if (typeof input.value === 'string') return { kind, value: input.value }
      return undefined
    case 'shadow':
      if (shadowKinds.includes(input.value)) return { kind, value: input.value }
      return undefined
    case 'scale':
      if (typeof input.value === 'number' && Number.isFinite(input.value)) return { kind, value: input.value }
      return undefined
    case 'opacity':
      if (typeof input.value === 'number' && Number.isFinite(input.value)) return { kind, value: input.value }
      return undefined
    case 'translate': {
      const x = typeof input.x === 'number' && Number.isFinite(input.x) ? input.x : 0
      const y = typeof input.y === 'number' && Number.isFinite(input.y) ? input.y : 0
      return { kind, x, y }
    }
    case 'rotate': {
      const deg = typeof input.deg === 'number' && Number.isFinite(input.deg) ? input.deg : 0
      return { kind, deg }
    }
    case 'outline':
      if (
        typeof input.color === 'string' &&
        typeof input.width === 'number' &&
        Number.isFinite(input.width)
      ) {
        return {
          kind,
          color: input.color,
          width: input.width,
          style: typeof input.style === 'string' ? input.style : undefined,
        }
      }
      return undefined
    case 'cursor':
      if (cursorKinds.includes(input.value)) return { kind, value: input.value }
      return undefined
    default:
      return undefined
  }
}

const sanitizeEffects = (input: any): Effect[] => {
  if (!Array.isArray(input)) return []
  const result: Effect[] = []
  input.forEach((item) => {
    const next = sanitizeEffect(item)
    if (next) result.push(next)
  })
  return result
}

const ensurePreset = (partial: Partial<ActionPreset> & { id?: string }, fallbackName?: string): ActionPreset => {
  const id = typeof partial.id === 'string' ? partial.id : newId()
  const name = typeof partial.name === 'string' && partial.name.trim()
    ? partial.name.trim()
    : fallbackName ?? 'Untitled preset'
  const triggers = sanitizeTriggers(partial.triggers)
  const when = sanitizeBehavior(partial.when)
  const effects = sanitizeEffects(partial.effects)
  const tags = sanitizeTags(partial.tags)
  const transitionMs = typeof partial.transitionMs === 'number' && Number.isFinite(partial.transitionMs)
    ? partial.transitionMs
    : undefined
  const easing = typeof partial.easing === 'string' && partial.easing.trim()
    ? partial.easing
    : undefined
  const updatedAt = typeof partial.updatedAt === 'number' ? partial.updatedAt : Date.now()
  const createdAt = typeof partial.createdAt === 'number' ? partial.createdAt : undefined

  return {
    id,
    name,
    description: typeof partial.description === 'string' ? partial.description : undefined,
    triggers: triggers.length ? triggers : ['hover'],
    when,
    effects: effects.length ? effects : [defaultEffect('scale')],
    transitionMs,
    easing,
    tags,
    updatedAt,
    createdAt,
    actions: Array.isArray(partial.actions) ? clone(partial.actions) : undefined,
  }
}

export const useActionsStore = create<ActionsStore>((set, get) => ({
  list: [],
  presets: {},
  currentId: undefined,

  createPreset() {
    const preset = ensurePreset({ triggers: ['hover'], when: [], effects: [defaultEffect('scale')], name: 'New preset' })
    set((state) => ({
      list: [...state.list, preset.id],
      presets: { ...state.presets, [preset.id]: preset },
      currentId: preset.id,
    }))
    return preset.id
  },

  duplicate(id) {
    const src = get().presets[id]
    if (!src) {
      return get().createPreset()
    }
    const copy = ensurePreset({
      ...clone(src),
      id: undefined,
      name: src.name ? `${src.name} Copy` : 'Preset Copy',
      updatedAt: Date.now(),
      createdAt: Date.now(),
    })
    set((state) => ({
      list: [...state.list, copy.id],
      presets: { ...state.presets, [copy.id]: copy },
      currentId: copy.id,
    }))
    return copy.id
  },

  update(id, patch) {
    set((state) => {
      const current = state.presets[id]
      if (!current) return {}
      const next: ActionPreset = {
        ...current,
        updatedAt: Date.now(),
      }

      if (patch.name !== undefined) {
        next.name = typeof patch.name === 'string' ? patch.name : current.name
      }
      if (patch.description !== undefined) {
        next.description = typeof patch.description === 'string' ? patch.description : undefined
      }
      if (patch.triggers !== undefined) {
        const triggers = sanitizeTriggers(patch.triggers)
        next.triggers = triggers.length ? triggers : []
      }
      if (patch.when !== undefined) {
        next.when = sanitizeBehavior(patch.when)
      }
      if (patch.effects !== undefined) {
        const effects = sanitizeEffects(patch.effects)
        next.effects = effects.length ? effects : []
      }
      if (patch.transitionMs !== undefined) {
        next.transitionMs =
          typeof patch.transitionMs === 'number' && Number.isFinite(patch.transitionMs)
            ? patch.transitionMs
            : undefined
      }
      if (patch.easing !== undefined) {
        next.easing = typeof patch.easing === 'string' && patch.easing.trim() ? patch.easing : undefined
      }
      if (patch.tags !== undefined) {
        next.tags = sanitizeTags(patch.tags)
      }
      if (patch.actions !== undefined) {
        next.actions = Array.isArray(patch.actions) ? clone(patch.actions) : undefined
      }

      return { presets: { ...state.presets, [id]: next } }
    })
  },

  remove(id) {
    set((state) => {
      if (!state.presets[id]) return {}
      const nextList = state.list.filter((item) => item !== id)
      const nextPresets = { ...state.presets }
      delete nextPresets[id]
      const currentId = state.currentId === id ? nextList[0] : state.currentId
      return { list: nextList, presets: nextPresets, currentId }
    })
  },

  setCurrent(id) {
    set({ currentId: id })
  },

  import(json) {
    const arr = Array.isArray(json) ? json : []
    const normalized = arr.map((item, idx) => ensurePreset(item ?? {}, `Preset ${idx + 1}`))
    const list = normalized.map((preset) => preset.id)
    const presets: Record<string, ActionPreset> = {}
    normalized.forEach((preset) => {
      presets[preset.id] = preset
    })
    set({ list, presets, currentId: list[0] })
  },

  export(ids) {
    const state = get()
    const targets = Array.isArray(ids) && ids.length ? ids : state.list
    const payload = targets
      .map((id) => state.presets[id])
      .filter((preset): preset is ActionPreset => !!preset)
      .map((preset) => clone(preset))
    return JSON.stringify(payload, null, 2)
  },
}))
