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
