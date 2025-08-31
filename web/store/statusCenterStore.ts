'use client'
import { create } from 'zustand'

type PRStatus = { number: number; state: string; merged: boolean; headSha: string; htmlUrl: string; checks: { name: string; status: string | null; conclusion: string | null; htmlUrl: string | null; startedAt?: string | null; completedAt?: string | null }[] }
type Runs = { total: number; items: { id: number; status: string | null; conclusion: string | null; event: string; url: string; headBranch: string; headSha: string; createdAt: string; updatedAt: string }[] }

type State = {
  lastPrNumber?: number
  lastPrUrl?: string
  pr?: PRStatus
  runs?: Runs
  open: boolean
  busy: boolean
}
type Actions = {
  setLastPr: (num?: number, url?: string) => void
  toggle: (v?: boolean) => void
  fetchPr: (num: number) => Promise<void>
  fetchRuns: () => Promise<void>
}
export const useStatusCenter = create<State & Actions>((set, get) => ({
  open: false,
  busy: false,
  setLastPr: (num, url) => set({ lastPrNumber: num, lastPrUrl: url }),
  toggle: (v) => set(s => ({ open: typeof v === 'boolean' ? v : !s.open })),
  fetchPr: async (num: number) => {
    set({ busy: true })
    try {
      const res = await fetch('/api/gh/pr-status', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prNumber: num }) })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'failed')
      set({ pr: j, lastPrNumber: j.number, lastPrUrl: j.htmlUrl })
    } finally {
      set({ busy: false })
    }
  },
  fetchRuns: async () => {
    set({ busy: true })
    try {
      const res = await fetch('/api/gh/workflow-runs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
      const j = await res.json()
      if (!res.ok) throw new Error(j?.error || 'failed')
      set({ runs: j })
    } finally {
      set({ busy: false })
    }
  },
}))
