'use client'
import { create } from 'zustand'
import type { AuditIssue } from '@/lib/audit/types'

type ApplyResult = { before: any; after: any; diffText?: string; thumbnails?: { before?: string; after?: string } }

type GuideState = {
  issues: AuditIssue[]
  loading: boolean
  selected?: string
  applyResult?: ApplyResult
  load: (slug: string) => Promise<void>
  select: (id?: string) => void
  clearResult: () => void
  setApplyResult: (r?: ApplyResult) => void
}

export const useGuideStore = create<GuideState>((set) => ({
  issues: [],
  loading: false,
  selected: undefined,
  applyResult: undefined,
  async load(slug) {
    set({ loading: true })
    try {
      const res = await fetch(`/api/ui-audit/issues?slug=${encodeURIComponent(slug)}`)
      const data = await res.json()
      set({ issues: Array.isArray(data) ? data : [], loading: false })
    } catch (e) {
      set({ loading: false })
    }
  },
  select(id) {
    set({ selected: id })
  },
  clearResult() {
    set({ applyResult: undefined })
  },
  setApplyResult(r) {
    set({ applyResult: r })
  },
}))

