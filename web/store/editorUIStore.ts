import { create } from 'zustand'

type OutlineMode = 'selection' | 'hover' | 'all'

type UIState = {
  showOutline: boolean
  outlineMode: OutlineMode
  setShowOutline: (v: boolean) => void
  setOutlineMode: (m: OutlineMode) => void
}

export const useEditorUIStore = create<UIState>((set) => ({
  showOutline: true,
  outlineMode: 'selection',
  setShowOutline: (v) => set({ showOutline: v }),
  setOutlineMode: (m) => set({ outlineMode: m }),
}))
