'use client'
import { create } from 'zustand'
import { produce } from 'immer'

export type ElmType = 'header' | 'footer' | 'sidebar' | 'hud' | 'button' | 'text' | 'container'

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
    loginButton?: {
      enabled: boolean
      label: string
      variant: 'solid' | 'outline'
      href?: string
    }
  }
}

type BuilderState = {
  elements: Elm[]
  selectedId: string | null
  snap: number
}

type BuilderActions = {
  addFromPalette: (type: ElmType, at?: { x: number; y: number }) => void
  move: (id: string, to: { x: number; y: number }) => void
  resize: (id: string, to: { w: number; h: number }) => void
  select: (id: string | null) => void
  updateProps: (id: string, patch: Partial<Elm['props']>) => void
  deleteSelected: () => void
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void
  nudge: (dx: number, dy: number) => void
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
    case 'container':
    default:
      return { w: 320, h: 200, text: 'Container' }
  }
}

export const useBuilderStore = create<BuilderState & BuilderActions>((set, get) => ({
  elements: [],
  selectedId: null,
  snap: SNAP,

  addFromPalette(type, at) {
    const id = `elm_${Date.now().toString(36)}`
    const { w, h, text } = defaultSize(type)
    const x = snap(at?.x ?? 40)
    const y = snap(at?.y ?? 40)
    set(
      produce((draft: BuilderState) => {
        draft.elements.push({
          id,
          type,
          x,
          y,
          w,
          h,
          visible: true,
          props: { text, bg: type === 'button' ? '#0ea5e9' : '#111827', color: '#e5e7eb' },
        })
        draft.selectedId = id
      }),
    )
  },

  move(id, to) {
    set(
      produce((draft: BuilderState) => {
        const e = draft.elements.find((x) => x.id === id)
        if (!e) return
        e.x = snap(to.x)
        e.y = snap(to.y)
      }),
    )
  },

  resize(id, to) {
    set(
      produce((draft: BuilderState) => {
        const e = draft.elements.find((x) => x.id === id)
        if (!e) return
        e.w = Math.max(16, snap(to.w))
        e.h = Math.max(16, snap(to.h))
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
        e.props = { ...(e.props ?? {}), ...patch }
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
}))

