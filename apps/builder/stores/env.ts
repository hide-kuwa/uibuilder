'use client'
import { create } from 'zustand'

export type EnvMode = 'mock' | 'live'

type EnvState = {
  mode: EnvMode
  setMode: (m: EnvMode) => void
}

export const useEnvStore = create<EnvState>((set) => ({
  mode: 'mock',
  setMode(m) { set({ mode: m }) },
}))

