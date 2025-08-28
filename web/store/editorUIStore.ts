import { create } from 'zustand'

type OutlineMode = 'selection' | 'hover' | 'all'

type UIState = {
  showOutline: boolean
  outlineMode: OutlineMode
  actionsEnabled: boolean
  interactingIds: Set<string>
  setShowOutline: (v: boolean) => void
  setOutlineMode: (m: OutlineMode) => void
  setActionsEnabled: (v: boolean) => void
  beginInteraction: (ids: string | string[]) => void
  endInteraction: (ids?: string | string[]) => void
  clearInteraction: () => void
}

export const useEditorUIStore = create<UIState>((set, get) => ({
  showOutline: true,
  outlineMode: 'selection',
  actionsEnabled: true,
  interactingIds: new Set(),
  setShowOutline: (v) => set({ showOutline: v }),
  setOutlineMode: (m) => set({ outlineMode: m }),
  setActionsEnabled: (v) => set({ actionsEnabled: v }),
  beginInteraction: (ids) => {
    const setIds = new Set(get().interactingIds)
    ;(Array.isArray(ids) ? ids : [ids]).forEach((id) => setIds.add(id))
    set({ interactingIds: setIds, actionsEnabled: false })
  },
  endInteraction: (ids) => {
    const setIds = new Set(get().interactingIds)
    if (ids)
      (Array.isArray(ids) ? ids : [ids]).forEach((id) => setIds.delete(id))
    set({ interactingIds: setIds, actionsEnabled: setIds.size === 0 })
  },
  clearInteraction: () => set({ interactingIds: new Set(), actionsEnabled: true }),
}))
