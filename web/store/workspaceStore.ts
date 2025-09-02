'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
type Workspace = 'travel' | 'accounting'

export const useWorkspace = create(
  persist<{ workspace: Workspace; setWorkspace: (w: Workspace) => void }>(
    (set) => ({ workspace: 'travel', setWorkspace: (w) => set({ workspace: w }) }),
    { name: 'workspace-v1' }
  )
)
