'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AnyStatus, StatusStyle } from '@/types/status'
import { DEFAULT_STATUS_CONFIG } from '@/types/status'

type StatusConfigState = {
  config: Record<AnyStatus, StatusStyle>
  setStyle: (k: AnyStatus, patch: Partial<StatusStyle>) => void
  reset: () => void
}

export const useStatusConfig = create<StatusConfigState>()(
  persist(
    (set, get) => ({
      config: DEFAULT_STATUS_CONFIG,
      setStyle: (k, patch) => {
        const cur = get().config
        set({ config: { ...cur, [k]: { ...cur[k], ...patch } } })
      },
      reset: () => set({ config: DEFAULT_STATUS_CONFIG }),
    }),
    { name: 'status-config-v1' }
  )
)
