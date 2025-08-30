'use client'
import { create } from 'zustand'
import { produce } from 'immer'
import type { DocgenMetaItem } from '@/lib/builder/docgen'
import { parseValue } from '@/lib/builder/docgen'
import { registry, type RegistryKey } from '@/lib/registry'

export type ElmType = RegistryKey | 'code'

export type Elm = {
  id: string
  type: ElmType
  x: number
  y: number
  w: number
  h: number
  visible?: boolean
  props?: {
    text?: string
    color?: string
    bg?: string
    align?: 'left' | 'center' | 'right'
    presetId?: string | null
    presetIds?: string[]
    loginButton?: {
      enabled: boolean
      label: string
      variant: 'solid' | 'outline'
      href?: string
    }
  }
  code?: {
    displayName: string
    importPath: string
    exportName?: string
    props: Record<string, unknown>
  }
}

type BuilderState = {
  elements: Elm[]
  selectedId: string | null
  selectedIds: string[]
  snap: number
  ui: {
    dragDraft?: { id: string; rect: { x: number; y: number; w: number; h: number } }
    guides: Array<{ axis: 'x' | 'y'; pos: number }>
  }
}

type BuilderActions = {
  addFromPalette: (
    type: ElmType,
    at?: { x: number; y: number },
    meta?: DocgenMetaItem,
  ) => void
  move: (id: string, to: { x: number; y: number }, snapGrid?: boolean) => void
  resize: (id: string, to: { w: number; h: number }, snapGrid?: boolean) => void
  setDragDraft: (
    d?: { id: string; rect: { x: number; y: number; w: number; h: number } },
  ) => void
  setGuides: (lines: Array<{ axis: 'x' | 'y'; pos: number }>) => void
  clearGuides: () => void
  select: (id: string | string[] | null) => void
  align: (
    kind:
      | 'left'
      | 'centerX'
      | 'right'
      | 'top'
      | 'centerY'
      | 'bottom'
      | 'hSpace'
      | 'vSpace',
  ) => void
  updateProps: (
    id: string,
    patch: Partial<Elm['props']> & { code?: Partial<Elm['code']> },
  ) => void
  deleteSelected: () => void
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void
  nudge: (dx: number, dy: number) => void
  setElements: (els: Elm[]) => void
}

const SNAP = 8
function snap(n: number, step = SNAP) {
  return Math.round(n / step) * step
}

function defaultSize(type: ElmType): { w: number; h: number; text?: string } {
  if (type === 'code') return { w: 160, h: 40 }
  const entry = (registry as any)[type]
  const size = entry?.meta?.defaultSize ?? { w: 320, h: 200 }
  const text = entry?.meta?.displayName
  return { ...size, text }
}

export const useBuilderStore = create<BuilderState & BuilderActions>((set, get) => ({
  elements: [],
  selectedId: null,
  selectedIds: [],
  snap: SNAP,
  ui: { guides: [] },

  addFromPalette(type, at, meta) {
    const id = `elm_${Date.now().toString(36)}`
    const { w, h, text } = defaultSize(type)
    const x = snap(at?.x ?? 40)
    const y = snap(at?.y ?? 40)
    set(
      produce((draft: BuilderState) => {
        if (type === 'code') {
          const initProps: Record<string, unknown> = {}
          meta?.props?.forEach((p) => {
            const v = parseValue(p.defaultValue?.value)
            if (v !== undefined) initProps[p.name] = v
          })
          draft.elements.push({
            id,
            type,
            x,
            y,
            w,
            h,
            visible: true,
            code: {
              displayName: meta?.displayName ?? 'Component',
              importPath: meta?.importPath ?? '',
              exportName: meta?.exportName,
              props: initProps,
            },
          })
        } else {
          draft.elements.push({
            id,
            type,
            x,
            y,
            w,
            h,
            visible: true,
            props: {
              text,
              bg: type === 'button' ? '#0ea5e9' : '#111827',
              color: '#e5e7eb',
            },
          })
        }
        draft.selectedId = id
        draft.selectedIds = [id]
      }),
    )
  },

  move(id, to, snapGrid = true) {
    set(
      produce((draft: BuilderState) => {
        const e = draft.elements.find((x) => x.id === id)
        if (!e) return
        e.x = snapGrid ? snap(to.x) : to.x
        e.y = snapGrid ? snap(to.y) : to.y
      }),
    )
  },

  resize(id, to, snapGrid = true) {
    set(
      produce((draft: BuilderState) => {
        const e = draft.elements.find((x) => x.id === id)
        if (!e) return
        e.w = Math.max(16, snapGrid ? snap(to.w) : to.w)
        e.h = Math.max(16, snapGrid ? snap(to.h) : to.h)
      }),
    )
  },

  setDragDraft(d) {
    set(
      produce((draft: BuilderState) => {
        draft.ui.dragDraft = d
      }),
    )
  },

  setGuides(lines) {
    set(
      produce((draft: BuilderState) => {
        draft.ui.guides = lines
      }),
    )
  },

  clearGuides() {
    set(
      produce((draft: BuilderState) => {
        draft.ui.guides = []
      }),
    )
  },

  select(id) {
    if (Array.isArray(id)) {
      set({ selectedId: id[id.length - 1] ?? null, selectedIds: id })
    } else {
      set({ selectedId: id, selectedIds: id ? [id] : [] })
    }
  },

  align(kind) {
    const ids = get().selectedIds
    const els = get()
      .elements.filter((e) => ids.includes(e.id) && e.visible !== false)
    if (els.length < 2) return
    const x1 = Math.min(...els.map((e) => e.x))
    const y1 = Math.min(...els.map((e) => e.y))
    const x2 = Math.max(...els.map((e) => e.x + e.w))
    const y2 = Math.max(...els.map((e) => e.y + e.h))
    set(
      produce((draft: BuilderState) => {
        const targets = draft.elements.filter((e) =>
          ids.includes(e.id) && e.visible !== false,
        )
        switch (kind) {
          case 'left':
            targets.forEach((e) => {
              e.x = x1
            })
            break
          case 'centerX': {
            const cx = (x1 + x2) / 2
            targets.forEach((e) => {
              e.x = Math.round(cx - e.w / 2)
            })
            break
          }
          case 'right':
            targets.forEach((e) => {
              e.x = x2 - e.w
            })
            break
          case 'top':
            targets.forEach((e) => {
              e.y = y1
            })
            break
          case 'centerY': {
            const cy = (y1 + y2) / 2
            targets.forEach((e) => {
              e.y = Math.round(cy - e.h / 2)
            })
            break
          }
          case 'bottom':
            targets.forEach((e) => {
              e.y = y2 - e.h
            })
            break
          case 'hSpace': {
            const sorted = [...targets].sort((a, b) => a.x - b.x)
            const min = sorted[0].x
            const max = sorted[sorted.length - 1].x +
              sorted[sorted.length - 1].w
            const total = sorted.reduce((s, e) => s + e.w, 0)
            const gap = sorted.length > 1 ? Math.round((max - min - total) / (sorted.length - 1)) : 0
            let cur = min
            sorted.forEach((e) => {
              e.x = cur
              cur += e.w + gap
            })
            break
          }
          case 'vSpace': {
            const sorted = [...targets].sort((a, b) => a.y - b.y)
            const min = sorted[0].y
            const max = sorted[sorted.length - 1].y +
              sorted[sorted.length - 1].h
            const total = sorted.reduce((s, e) => s + e.h, 0)
            const gap = sorted.length > 1 ? Math.round((max - min - total) / (sorted.length - 1)) : 0
            let cur = min
            sorted.forEach((e) => {
              e.y = cur
              cur += e.h + gap
            })
            break
          }
        }
      }),
    )
  },

  updateProps(id, patch) {
    set(
      produce((draft: BuilderState) => {
        const e = draft.elements.find((x) => x.id === id)
        if (!e) return
        const { code, ...rest } = patch as any
        if (Object.keys(rest).length) {
          e.props = { ...(e.props ?? {}), ...rest }
        }
        if (code) {
          e.code = {
            ...(e.code ?? { displayName: '', importPath: '', props: {} }),
            ...code,
            props: {
              ...(e.code?.props ?? {}),
              ...(code.props ?? {}),
            },
          }
        }
      }),
    )
  },

  deleteSelected() {
    const id = get().selectedId
    if (!id) return
    set(
      produce((draft: BuilderState) => {
        draft.elements = draft.elements.filter((x) => x.id !== id)
        draft.selectedId = null
      }),
    )
  },

  bringToFront(id) {
    set(
      produce((draft: BuilderState) => {
        const i = draft.elements.findIndex((x) => x.id === id)
        if (i < 0) return
        const [e] = draft.elements.splice(i, 1)
        draft.elements.push(e)
      }),
    )
  },

  sendToBack(id) {
    set(
      produce((draft: BuilderState) => {
        const i = draft.elements.findIndex((x) => x.id === id)
        if (i < 0) return
        const [e] = draft.elements.splice(i, 1)
        draft.elements.unshift(e)
      }),
    )
  },

  nudge(dx, dy) {
    const id = get().selectedId
    if (!id) return
    const el = get().elements.find((x) => x.id === id)
    if (!el) return
    get().move(id, { x: el.x + dx, y: el.y + dy })
  },

  setElements(els) {
    set(
      produce((draft: BuilderState) => {
        draft.elements = els
      }),
    )
  },
}))

