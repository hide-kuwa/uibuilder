export type TriggerPhase = 'enter' | 'leave'

export type ActionTrigger =
  | { kind: 'click'; once?: boolean }
  | { kind: 'hover'; phase?: TriggerPhase; once?: boolean }
  | { kind: 'inView'; threshold?: number; rootMargin?: string; once?: boolean }

export type ClassEffect = {
  kind: 'class'
  /** default: self element */
  target?: string | string[]
  add?: string[]
  remove?: string[]
  toggle?: string[]
}

export type EmitEffect = {
  kind: 'emit'
  name: string
  detail?: any
}

export type ScrollEffect = {
  kind: 'scroll'
  selector: string
  behavior?: ScrollBehavior
}

export type NavigateEffect = {
  kind: 'navigate'
  href: string
  target?: '_self' | '_blank'
}

export type ActionEffect = ClassEffect | EmitEffect | ScrollEffect | NavigateEffect

export type ActionConcurrency = 'restart' | 'ignore'

export interface ActionTransition {
  durationMs?: number
  delayMs?: number
  easing?: string
}

export interface ActionRule {
  id?: string
  sourceId: string
  triggers: ActionTrigger[]
  effects: ActionEffect[]
  transition?: ActionTransition
  concurrency?: ActionConcurrency
  /** If true, skip delays/duration when prefers-reduced-motion */
  disableMotionWhenReduced?: boolean
}

export type PackedTrigger = {
  k: 'c' | 'he' | 'hl' | 'v'
  th?: number
  rm?: string
  o?: 1
}

export type PackedEffect =
  | { k: 'c'; t?: string | string[]; add?: string; rm?: string; tg?: string }
  | { k: 'e'; n: string; d?: any }
  | { k: 's'; sel: string; bh?: ScrollBehavior }
  | { k: 'n'; href: string; tgt?: '_self' | '_blank' }

export type PackedTransition = { d?: number; dl?: number; e?: string }

export type PackedRule = {
  id?: string
  tr: PackedTrigger[]
  fx: PackedEffect[]
  trn?: PackedTransition
  cc?: 'r' | 'i'
  rm?: 1
}

// --- Builder preset types ---

export type Effect =
  | { kind: 'bgColor'; value: string }
  | { kind: 'textColor'; value: string }
  | { kind: 'borderColor'; value: string }
  | { kind: 'shadow'; value: 'sm' | 'md' | 'lg' | 'xl' }
  | { kind: 'scale'; value: number }
  | { kind: 'opacity'; value: number }
  | { kind: 'translate'; x?: number; y?: number }
  | { kind: 'rotate'; deg: number }
  | { kind: 'outline'; color: string; width: number; style?: 'solid' | 'dashed' | 'dotted' }
  | { kind: 'cursor'; value: 'default' | 'pointer' | 'move' | 'grab' | 'text' }

export type Trigger = 'hover' | 'active' | 'focus' | 'focusWithin' | 'groupHover'

export type BehaviorTrigger = 'click' | 'doubleClick' | 'mount' | 'delay' | 'inView'

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [k: string]: Json }

export type Logic =
  | { '==': [Json, Json] }
  | { '===': [Json, Json] }
  | { '!=': [Json, Json] }
  | { '!==': [Json, Json] }
  | { '<': [Json, Json] }
  | { '<=': [Json, Json] }
  | { '>': [Json, Json] }
  | { '>=': [Json, Json] }
  | { and: Logic[] }
  | { or: Logic[] }
  | { '!': [Logic] }
  | { '+': Json[] }
  | { '-': Json[] }
  | { '*': Json[] }
  | { '/': Json[] }
  | { '%': [Json, Json] }
  | { var: string }
  | Json

export type ActionKind = 'openUrl' | 'navigate' | 'emitEvent' | 'setProp'

export type Target =
  | { type: 'nodeId'; value: string }
  | { type: 'query'; value: string }

export type ActionBase = {
  if?: Logic
  throttleMs?: number
  debounceMs?: number
}

export type Action =
  | (ActionBase & { kind: 'openUrl'; url: string; target?: '_blank' | '_self' })
  | (ActionBase & { kind: 'navigate'; to: string })
  | (ActionBase & { kind: 'emitEvent'; name: string; payload?: Json })
  | (ActionBase & {
      kind: 'setProp'
      selector?: Target
      prop: string
      value: Json | string
    })

export type ActionPreset = {
  id: string
  name: string
  description?: string
  triggers: Trigger[]
  effects: Effect[]
  transitionMs?: number
  easing?: string
  tags?: string[]
  updatedAt: number
  createdAt?: number
  when?: BehaviorTrigger[]
  actions?: Action[]
}

export const defaultEffect = (k: Effect['kind']): Effect => {
  switch (k) {
    case 'bgColor':
      return { kind: 'bgColor', value: '#0f172a' }
    case 'textColor':
      return { kind: 'textColor', value: '#e5e7eb' }
    case 'borderColor':
      return { kind: 'borderColor', value: '#334155' }
    case 'shadow':
      return { kind: 'shadow', value: 'md' }
    case 'scale':
      return { kind: 'scale', value: 1.05 }
    case 'opacity':
      return { kind: 'opacity', value: 0.9 }
    case 'translate':
      return { kind: 'translate', x: 0, y: -2 }
    case 'rotate':
      return { kind: 'rotate', deg: 1 }
    case 'outline':
      return { kind: 'outline', color: '#22d3ee', width: 1, style: 'dashed' }
    case 'cursor':
      return { kind: 'cursor', value: 'pointer' }
  }
}
