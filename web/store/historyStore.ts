import { create } from 'zustand'
import { Patch, applyPatches } from 'immer'

interface Entry {
  patches: Patch[]
  inverse: Patch[]
}

interface HistoryState {
  stack: Entry[]
  index: number
  limit: number
  draft: Entry | null
  push: (patches: Patch[], inverse: Patch[]) => void
  start: () => void
  commit: () => void
  undo: <T>(state: T) => T
  redo: <T>(state: T) => T
  clear: () => void
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  stack: [],
  index: -1,
  limit: 100,
  draft: null,
  push(patches, inverse) {
    const draft = get().draft
    if (draft) {
      draft.patches.push(...patches)
      draft.inverse = [...inverse, ...draft.inverse]
      set({ draft })
      return
    }
    let stack = get().stack.slice(0, get().index + 1)
    stack.push({ patches, inverse })
    if (stack.length > get().limit) {
      stack = stack.slice(stack.length - get().limit)
    }
    set({ stack, index: stack.length - 1 })
  },
  start() {
    set({ draft: { patches: [], inverse: [] } })
  },
  commit() {
    const draft = get().draft
    if (draft && draft.patches.length) {
      let stack = get().stack.slice(0, get().index + 1)
      stack.push(draft)
      if (stack.length > get().limit) {
        stack = stack.slice(stack.length - get().limit)
      }
      set({ stack, index: stack.length - 1, draft: null })
    } else {
      set({ draft: null })
    }
  },
  undo(state) {
    const { index, stack } = get()
    if (index < 0) return state
    const entry = stack[index]
    set({ index: index - 1 })
    return applyPatches(state, entry.inverse)
  },
  redo(state) {
    const { index, stack } = get()
    if (index + 1 >= stack.length) return state
    const entry = stack[index + 1]
    set({ index: index + 1 })
    return applyPatches(state, entry.patches)
  },
  clear() {
    set({ stack: [], index: -1, draft: null })
  },
}))
