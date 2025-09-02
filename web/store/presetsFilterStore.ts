'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type Domain = 'travel' | 'accounting'

type PresetsFilterState = {
  activeDomains: Record<Domain, boolean>
  alwaysShowCommon: boolean
  toggleDomain: (d: Domain) => void
  setOnly: (d: Domain) => void
  reset: () => void
}

export const usePresetsFilter = create(
  persist<PresetsFilterState>(
    (set) => ({
      activeDomains: { travel: true, accounting: false },
      alwaysShowCommon: true,
      toggleDomain: (d) =>
        set((s) => ({ activeDomains: { ...s.activeDomains, [d]: !s.activeDomains[d] } })),
      setOnly: (d) =>
        set(() => ({ activeDomains: { travel: false, accounting: false, [d]: true } as Record<Domain, boolean> })),
      reset: () => set(() => ({ activeDomains: { travel: true, accounting: false } })),
    }),
    { name: 'presets-filter-v1' },
  ),
)
