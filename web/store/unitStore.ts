'use client'
import { create } from 'zustand'

export type Unit = 'px' | 'percent' | 'rem'

interface UnitState {
  unit: Unit
  remBase: number
  percentBase: { width: number; height: number }
  setUnit: (u: Unit) => void
  setRemBase: (n: number) => void
  setPercentBase: (size: { width: number; height: number }) => void
}

export const useUnitStore = create<UnitState>((set) => ({
  unit: 'px',
  remBase: 16,
  percentBase: { width: 1, height: 1 },
  setUnit: (u) => set({ unit: u }),
  setRemBase: (n) => set({ remBase: n }),
  setPercentBase: (size) => set({ percentBase: size }),
}))

