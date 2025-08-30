'use client'
import { create } from 'zustand'
import { produce } from 'immer'
import type { DocgenMetaItem } from '@/lib/builder/docgen'
import { parseValue } from '@/lib/builder/docgen'

export type ElmType =
  | 'header'
  | 'footer'
  | 'sidebar'
  | 'hud'
  | 'button'
  | 'text'
  | 'container'
  | 'code'

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
  select: (id: string | null) => void
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
  switch (type) {
    case 'header':
      return { w: 960, h: 64, text: 'Header' }
    case 'footer':
      return { w: 960, h: 56, text: 'Footer' }
    case 'sidebar':
      return { w: 240, h: 600, text: 'Sidebar' }
    case 'hud':
      return { w: 280, h: 44, text: 'HUD' }
    case 'button':
      return { w: 120, h: 36, text: 'Button' }
    case 'text':
      return { w: 200, h: 24, text: 'Text' }
    case 'code':
      return { w: 160, h: 40 }
    case 'container':
    default:
      return { w: 320, h: 200, text: 'Container' }
  }
}

export const useBuilderStore = create<BuilderState & BuilderActions>((set, get) => ({
  elements: [],
  selectedId: null,
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
    set({ selectedId: id })
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

