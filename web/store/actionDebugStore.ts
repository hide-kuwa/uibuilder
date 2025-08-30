'use client'
import { create } from 'zustand'
import type { ActionLogEntry, BehaviorTrigger } from '@/types/interactions'

type State = {
  enabled: boolean
  intercept: boolean
  entries: ActionLogEntry[]
  filters: {
    nodeId?: string
    trigger?: BehaviorTrigger
    kind?: string
  }
  toggleEnabled(): void
  setEnabled(v:boolean): void
  setIntercept(v:boolean): void
  clear(): void
  push(e: ActionLogEntry): void
  setFilters(f: Partial<State['filters']>): void
}

export const useActionDebugStore = create<State>((set,get)=>({
  enabled:false,
  intercept:false,
  entries:[],
  filters:{},
  toggleEnabled(){ set(s=>({enabled:!s.enabled})) },
  setEnabled(v){ set({enabled:v}) },
  setIntercept(v){ set({intercept:v}) },
  clear(){ set({entries:[]}) },
  push(e){ set(s=>({ entries:[e, ...s.entries].slice(0,500) })) },
  setFilters(f){ set(s=>({ filters:{...s.filters, ...f} })) }
}))
