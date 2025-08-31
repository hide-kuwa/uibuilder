import { create } from 'zustand'

export type LogLevel = 'log' | 'warn' | 'error'
export type DevLog = { id: string; level: LogLevel; msg: string; ts: number }

type State = {
  logs: DevLog[]
  paused: boolean
  level: LogLevel | 'all'
}
type Actions = {
  add: (l: Omit<DevLog,'id'|'ts'> & { msg: any }) => void
  clear: () => void
  setPaused: (v: boolean) => void
  setLevel: (lv: State['level']) => void
}
export const useDevLogStore = create<State & Actions>((set, get)=>({
  logs: [],
  paused: false,
  level: 'all',
  add: (l) => {
    if (get().paused) return
    const msg = typeof l.msg === 'string' ? l.msg : (()=>{ try { return JSON.stringify(l.msg) } catch { return String(l.msg) } })()
    set(s => ({ logs: [{ id: Math.random().toString(36).slice(2), level: l.level, msg, ts: Date.now() }, ...s.logs].slice(0,500) }))
  },
  clear: () => set({ logs: [] }),
  setPaused: (v) => set({ paused: v }),
  setLevel: (lv) => set({ level: lv }),
}))

