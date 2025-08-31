'use client'
import { create } from 'zustand'

export type TransitionKind = 'instant' | 'fade' | 'slide'

type State = {
  currentPageId: string | null
  backStack: string[]
  fwdStack: string[]
  defaultTransition: TransitionKind
  durationMs: number
  direction: 1 | -1
}
type Actions = {
  init: (initial: string | null) => void
  goTo: (pageId: string, opts?: { kind?: TransitionKind; durationMs?: number }) => void
  back: () => void
  forward: () => void
  restart: () => void
  setTransition: (kind: TransitionKind) => void
  setDuration: (ms: number) => void
}
export const usePreviewNavStore = create<State & Actions>((set, get) => ({
  currentPageId: null,
  backStack: [],
  fwdStack: [],
  defaultTransition: 'fade',
  durationMs: 250,
  direction: 1,
  init: (initial) => set({ currentPageId: initial ?? null, backStack: [], fwdStack: [], direction: 1 }),
  goTo: (pageId, opts) => {
    const s = get()
    const kind = opts?.kind ?? s.defaultTransition
    const dur = opts?.durationMs ?? s.durationMs
    set({ currentPageId: pageId, backStack: s.currentPageId ? [s.currentPageId, ...s.backStack] : s.backStack, fwdStack: [], defaultTransition: kind, durationMs: dur, direction: 1 })
  },
  back: () => {
    const s = get()
    if (!s.backStack.length) return
    const [prev, ...rest] = s.backStack
    set({ currentPageId: prev, backStack: rest, fwdStack: s.currentPageId ? [s.currentPageId, ...s.fwdStack] : s.fwdStack, direction: -1 })
  },
  forward: () => {
    const s = get()
    if (!s.fwdStack.length) return
    const [next, ...rest] = s.fwdStack
    set({ currentPageId: next, backStack: s.currentPageId ? [s.currentPageId, ...s.backStack] : s.backStack, fwdStack: rest, direction: 1 })
  },
  restart: () => {
    const s = get()
    if (!s.backStack.length) return
    const tail = s.backStack[s.backStack.length - 1]
    set({ currentPageId: tail, backStack: [], fwdStack: s.currentPageId ? [s.currentPageId, ...s.backStack.slice(0, -1), ...s.fwdStack] : s.fwdStack, direction: -1 })
  },
  setTransition: (kind) => set({ defaultTransition: kind }),
  setDuration: (ms) => set({ durationMs: Math.max(0, Math.min(ms, 2000)) }),
}))
