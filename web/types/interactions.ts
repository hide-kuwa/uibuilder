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

export type InteractionPreset = {
  id: string
  name: string
  triggers: Trigger[]
  effects: Effect[]
  transitionMs?: number
  easing?: string
  tags?: string[]
  updatedAt: number
  actions?: Action[]
  when?: BehaviorTrigger[]
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

export type ActionKind = 'openUrl' | 'navigate' | 'emitEvent' | 'setProp'
export type BehaviorTrigger =
  | 'click'
  | 'doubleClick'
  | 'mount'
  | 'delay'
  | 'inView'

export type ActionLogEntry = {
  id: string
  t0: number
  t1?: number
  nodeId: string
  trigger: BehaviorTrigger
  actions: { kind: ActionKind; payload: any }[]
  presetIds: string[]
  status: 'ok' | 'error' | 'skipped'
  error?: string
}

export type Json =
  | null | boolean | number | string
  | Json[] | { [k: string]: Json }

export type Logic =
  | { '==': [Json, Json] } | { '===': [Json, Json] }
  | { '!=': [Json, Json] } | { '!==': [Json, Json] }
  | { '<': [Json, Json] }  | { '<=': [Json, Json] }
  | { '>': [Json, Json] }  | { '>=': [Json, Json] }
  | { 'and': Logic[] } | { 'or': Logic[] } | { '!': [Logic] }
  | { '+': Json[] } | { '-': Json[] } | { '*': Json[] } | { '/': Json[] } | { '%': [Json, Json] }
  | { 'var': string }
  | Json

export type ActionBase = {
  if?: Logic
  throttleMs?: number
  debounceMs?: number
}

export type Action =
  | (ActionBase & { kind:'openUrl';  url:string; target?:'_blank'|'_self' })
  | (ActionBase & { kind:'navigate'; to:string })
  | (ActionBase & { kind:'emitEvent'; name:string; payload?:Json })
  | (ActionBase & { kind:'setProp';   selector?:Target; prop:string; value:Json | string })

export type Target = { type:'nodeId'; value:string } | { type:'query'; value:string }
