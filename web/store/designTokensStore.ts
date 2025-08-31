'use client'
import { create } from 'zustand'

type State = {
  tokens: Record<string, any>
}

type Actions = {
  getAll: () => Record<string, any>
  replaceAll: (t: Record<string, any>) => void
}

export const useDesignTokens = create<State & Actions>((set, get) => ({
  tokens: {},
  getAll: () => get().tokens,
  replaceAll: (t) => set({ tokens: t }),
}))

