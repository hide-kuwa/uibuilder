import { stableStringify } from '../export/stableStringify'
import type {
  ActionEffect,
  ActionRule,
  ActionTransition,
  PackedEffect,
  PackedRule,
  PackedTransition,
  PackedTrigger,
  ActionTrigger,
} from './types'

const DEFAULT_DURATION = 150
const DEFAULT_DELAY = 0
const DEFAULT_EASING = 'ease-out'

const round = (value: number) => {
  if (!Number.isFinite(value)) return undefined
  const rounded = Number(value.toFixed(4))
  return Object.is(rounded, -0) ? 0 : rounded
}

const normalizeStringArray = (value?: string | string[]) => {
  if (value == null) return undefined
  const list = Array.isArray(value) ? value : String(value).split(/\s+/)
  const filtered = list.map((c) => c.trim()).filter(Boolean)
  if (!filtered.length) return undefined
  const uniq = Array.from(new Set(filtered))
  uniq.sort()
  return uniq
}

const normalizeClassList = (value?: string | string[]) => {
  const uniq = normalizeStringArray(value)
  if (!uniq?.length) return undefined
  return uniq.join(' ')
}

const normalizeTargets = (value?: string | string[]) => {
  const uniq = normalizeStringArray(value)
  if (!uniq?.length) return undefined
  return uniq.length === 1 ? uniq[0] : uniq
}

const denormalizeTargets = (value: string | string[] | undefined): string[] | undefined => {
  if (!value) return undefined
  const arr = Array.isArray(value) ? value : [value]
  return arr.map((v) => String(v))
}

const packTrigger = (trigger: ActionTrigger): PackedTrigger => {
  switch (trigger.kind) {
    case 'click':
      return { k: 'c', o: trigger.once ? 1 : undefined }
    case 'hover':
      return {
        k: trigger.phase === 'leave' ? 'hl' : 'he',
        o: trigger.once ? 1 : undefined,
      }
    case 'inView':
      return {
        k: 'v',
        th: trigger.threshold != null ? round(trigger.threshold) : undefined,
        rm: trigger.rootMargin,
        o: trigger.once ? 1 : undefined,
      }
    default:
      return { k: 'c' }
  }
}

const unpackTrigger = (trigger: PackedTrigger): ActionTrigger => {
  if (trigger.k === 'c') return { kind: 'click', once: trigger.o === 1 }
  if (trigger.k === 'he') return { kind: 'hover', phase: 'enter', once: trigger.o === 1 }
  if (trigger.k === 'hl') return { kind: 'hover', phase: 'leave', once: trigger.o === 1 }
  return {
    kind: 'inView',
    threshold: trigger.th,
    rootMargin: trigger.rm,
    once: trigger.o === 1,
  }
}

const packEffect = (effect: ActionEffect): PackedEffect => {
  switch (effect.kind) {
    case 'class': {
      const target = normalizeTargets(effect.target)
      const add = normalizeClassList(effect.add)
      const rm = normalizeClassList(effect.remove)
      const tg = normalizeClassList(effect.toggle)
      const packed: PackedEffect = { k: 'c' }
      if (target) packed.t = target
      if (add) packed.add = add
      if (rm) packed.rm = rm
      if (tg) packed.tg = tg
      return packed
    }
    case 'emit':
      return { k: 'e', n: effect.name, d: effect.detail }
    case 'scroll':
      return { k: 's', sel: effect.selector, bh: effect.behavior }
    case 'navigate':
      return { k: 'n', href: effect.href, tgt: effect.target }
    default:
      return { k: 'c' }
  }
}

const unpackEffect = (effect: PackedEffect): ActionEffect => {
  switch (effect.k) {
    case 'e':
      return { kind: 'emit', name: effect.n, detail: effect.d }
    case 's':
      return { kind: 'scroll', selector: effect.sel, behavior: effect.bh }
    case 'n':
      return { kind: 'navigate', href: effect.href, target: effect.tgt }
    default: {
      const add = effect.add ? effect.add.split(/\s+/).filter(Boolean) : undefined
      const rm = effect.rm ? effect.rm.split(/\s+/).filter(Boolean) : undefined
      const tg = effect.tg ? effect.tg.split(/\s+/).filter(Boolean) : undefined
      return {
        kind: 'class',
        target: denormalizeTargets(effect.t),
        add,
        remove: rm,
        toggle: tg,
      }
    }
  }
}

const packTransition = (transition?: ActionTransition): PackedTransition | undefined => {
  if (!transition) return undefined
  const out: PackedTransition = {}
  const d = transition.durationMs
  const dl = transition.delayMs
  const easing = transition.easing
  if (d != null) {
    const v = round(d)
    if (v != null && v !== DEFAULT_DURATION) out.d = v
  }
  if (dl != null) {
    const v = round(dl)
    if (v != null && v !== DEFAULT_DELAY) out.dl = v
  }
  if (easing && easing !== DEFAULT_EASING) out.e = easing
  return Object.keys(out).length ? out : undefined
}

const unpackTransition = (transition?: PackedTransition): ActionTransition | undefined => {
  if (!transition) return undefined
  return {
    durationMs: transition.d ?? DEFAULT_DURATION,
    delayMs: transition.dl ?? DEFAULT_DELAY,
    easing: transition.e ?? DEFAULT_EASING,
  }
}

const packRule = (rule: ActionRule): PackedRule => {
  const triggers = rule.triggers.map(packTrigger)
  triggers.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  const effects = rule.effects.map(packEffect)
  effects.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  const packed: PackedRule = {
    id: rule.id,
    tr: triggers,
    fx: effects,
  }
  const trn = packTransition(rule.transition)
  if (trn) packed.trn = trn
  if (rule.concurrency === 'ignore') packed.cc = 'i'
  if (rule.disableMotionWhenReduced) packed.rm = 1
  return packed
}

const unpackRule = (rule: PackedRule, sourceId: string): ActionRule => {
  return {
    id: rule.id,
    sourceId,
    triggers: (rule.tr ?? []).map(unpackTrigger),
    effects: (rule.fx ?? []).map(unpackEffect),
    transition: unpackTransition(rule.trn),
    concurrency: rule.cc === 'i' ? 'ignore' : 'restart',
    disableMotionWhenReduced: rule.rm === 1,
  }
}

export const encodeActionRules = (rules: ActionRule[]): string => {
  const packed = rules.map(packRule)
  packed.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  return stableStringify(packed.length === 1 ? packed[0] : packed)
}

export const decodeActionRules = (text: string, sourceId: string): ActionRule[] => {
  if (!text) return []
  let parsed: any
  try {
    parsed = JSON.parse(text)
  } catch {
    return []
  }
  const packedRules: PackedRule[] = Array.isArray(parsed) ? parsed : [parsed]
  return packedRules.map((rule) => unpackRule(rule, sourceId))
}
