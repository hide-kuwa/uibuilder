'use client'
import { create } from 'zustand'

type State = { open: boolean; contentNodeId?: string | null }
type Actions = { openWith: (id: string) => void; close: () => void }

export const useModalStore = create<State & Actions>((set) => ({
  open: false,
  contentNodeId: null,
  openWith: (id) => set({ open: true, contentNodeId: id }),
  close: () => set({ open: false, contentNodeId: null }),
}))
