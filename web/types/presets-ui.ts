import type { MotionEffect } from './motion'

export type JsonLogic = any // 既存実装か後日差し替え

export type TriggerState = {
  hover: boolean
  active: boolean
  focus: boolean
  focusWithin: boolean
  groupHover: boolean
  transitionMs: number
  easing: string
}

export type WhenFlags = {
  click: boolean
  doubleClick: boolean
  mount: boolean
  inView: boolean
  delayMs?: number | null
}

export type EffectKind = 'scale'|'rotate'|'bgColor'|'shadow'|'opacity'
export type Effect = { kind: EffectKind; value?: any }

export type ActionType = 'openUrl'|'emit'|'toggleVar'|'copyToClipboard'|'navigate'
export type ActionDef = {
  type: ActionType
  params: Record<string, any>
  if?: JsonLogic | null
  throttleMs?: number | null
  debounceMs?: number | null
  when?: WhenFlags // ← 保存時はここに格納（UIではActions枠内に表示）
}

export type PresetDraft = {
  name: string
  triggers: TriggerState
  effects: Effect[]
  actions: ActionDef[]
  motion: MotionEffect[]
}
