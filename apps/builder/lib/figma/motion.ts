import type { Node } from '../figma/model'

type Simple = { durationMs?: number; delayMs?: number; easing?: string }
type TransitionItem = { property: string; durationMs?: number; delayMs?: number; easing?: string }
type MotionUnion = Simple | { transition?: TransitionItem[] } | any

export function buildTransition(m?: MotionUnion): string | undefined {
  if (!m) return undefined
  const arr: TransitionItem[] | undefined = Array.isArray((m as any).transition)
    ? (m as any).transition
    : undefined
  if (arr && arr.length) {
    return arr
      .map((t) => `${t.property} ${t.durationMs ?? 160}ms ${t.easing ?? 'ease-out'} ${t.delayMs ?? 0}ms`)
      .join(', ')
  }
  const d = (m as Simple).durationMs ?? 160
  const e = (m as Simple).easing ?? 'ease-out'
  const del = (m as Simple).delayMs ?? 0
  return `all ${d}ms ${e} ${del}ms`
}

