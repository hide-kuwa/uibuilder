// apps/builder/lib/actions/apply.ts
import type { InteractionPreset } from '@/types/interactions'

export type ApplyMode = 'replace' | 'append' | 'remove'

export type Json =
  | null
  | boolean
  | number
  | string
  | Json[]
  | { [key: string]: Json }

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

export type ActionTarget = 'self' | 'group' | 'descendants'

export type BehaviorTrigger =
  | 'click'
  | 'doubleClick'
  | 'mount'
  | 'delay'
  | 'inView'

export type TargetSelector =
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
      selector?: TargetSelector
      prop: string
      value: Json | string
    })

export type ActionRule = {
  id: string
  name: string
  trigger: BehaviorTrigger
  target: ActionTarget
  actions: Action[]
  presetId?: string
  presetName?: string
}

export type NodeWithActions = {
  id: string
  name?: string
  actionRules?: ActionRule[]
  [key: string]: unknown
}

const uid = () => `ar_${Math.random().toString(36).slice(2, 10)}`

function ensureTriggerList(preset: InteractionPreset): BehaviorTrigger[] {
  const list = Array.isArray((preset as any)?.when)
    ? ((preset as any).when as BehaviorTrigger[])
    : []
  if (list.length > 0) return list
  return ['click']
}

function notifyHistory(detail: any) {
  if (typeof window === 'undefined') return
  try {
    window.dispatchEvent(new CustomEvent('builder:history', { detail }))
  } catch {
    /* noop */
  }
}

function notifyRuntime(detail: any) {
  if (typeof window === 'undefined') return
  try {
    window.dispatchEvent(new CustomEvent('builder:actions:changed', { detail }))
  } catch {
    /* noop */
  }
  try {
    const engine: any = (window as any).__builderActionEngine
    if (engine && typeof engine.refresh === 'function') engine.refresh(detail)
  } catch {
    /* noop */
  }
}

export function createEmptyRule(): ActionRule {
  return {
    id: uid(),
    name: 'New action',
    trigger: 'click',
    target: 'self',
    actions: [],
  }
}

export function toRuntimeRules(
  preset: InteractionPreset,
  target: ActionTarget = 'self',
): ActionRule[] {
  const name = (preset as any)?.name ?? preset.id ?? 'Preset'
  const actions = Array.isArray((preset as any)?.actions)
    ? ((preset as any).actions as Action[])
    : []
  const triggers = ensureTriggerList(preset)
  return triggers.map((trigger) => ({
    id: uid(),
    name,
    trigger,
    target,
    actions,
    presetId: preset.id,
    presetName: name,
  }))
}

function mergeRules(
  current: ActionRule[] | undefined,
  incoming: ActionRule[],
  mode: ApplyMode,
  presetId: string,
): ActionRule[] {
  const cur = Array.isArray(current) ? current : []
  if (mode === 'replace') return [...incoming]
  if (mode === 'append') return [...cur, ...incoming]
  if (mode === 'remove') return cur.filter((rule) => rule.presetId !== presetId)
  return cur
}

export function applyPresetToNodes<T extends NodeWithActions>(
  preset: InteractionPreset,
  nodes: T[],
  mode: ApplyMode,
): T[] {
  if (!Array.isArray(nodes) || nodes.length === 0) return nodes
  const runtimeRules = toRuntimeRules(preset)
  const nextNodes = nodes.map((node) => {
    const nextRules = mergeRules(node.actionRules, runtimeRules, mode, preset.id)
    return { ...node, actionRules: nextRules }
  })
  const detail = {
    type: 'actions.apply',
    presetId: preset.id,
    presetName: (preset as any)?.name,
    mode,
    nodeIds: nodes.map((n) => n.id),
    ruleCount: runtimeRules.length,
  }
  notifyRuntime(detail)
  notifyHistory(detail)
  return nextNodes
}

