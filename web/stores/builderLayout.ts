'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BuilderLayout = {
  left: string | ''
  right: string | ''
  top?: string | ''
  bottom?: string | ''
}

interface BuilderLayoutState {
  layout: BuilderLayout
  setLayout: (next: BuilderLayout) => void
  resetLayout: () => void
}

const defaultLayout: BuilderLayout = {
  left: 'palette',
  right: 'inspector',
  top: 'toolbar',
  bottom: '',
}

export const useBuilderLayout = create<BuilderLayoutState>()(
  persist(
    (set) => ({
      layout: defaultLayout,
      setLayout: (next) => set({ layout: next }),
      resetLayout: () => set({ layout: defaultLayout }),
    }),
    { name: 'builder-layout' }
  )
)

