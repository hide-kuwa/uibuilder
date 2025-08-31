'use client'
import { create } from 'zustand'
import { audit, type AuditResult } from '@/lib/analysis/uiMetrics'
import { useBuilderStore } from '@/store/builderStore'
import { useDesignTokens } from '@/store/designTokensStore'

type State = { last?: AuditResult; busy:boolean }
type Actions = { run: (canvas:{width:number;height:number}) => void }

export const useUIAudit = create<State & Actions>((set) => ({
  busy:false,
  run: (canvas) => {
    set({busy:true})
    const els = useBuilderStore.getState().elements as any[]
    const tokens = useDesignTokens.getState().getAll?.() ?? useDesignTokens.getState().tokens
    const result = audit(els as any, tokens as any, canvas)
    set({ last: result, busy:false })
  }
}))
