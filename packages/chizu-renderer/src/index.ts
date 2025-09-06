import React from 'react'
import type { Bindings } from '@chizu/types'
export { generatePageCode } from './codegen'
export { RuntimeProvider, useFlowRuntime, getRef, evalFormula } from './runtime'

export function resolveBinding(runtime: any, nodeId: string, props: Record<string, any>, bindings?: Bindings) {
  if (!bindings) return props
  const out: Record<string, any> = { ...props }
  for (const [prop, b] of Object.entries(bindings)) {
    try {
      const ins = (b.inputs ?? []).map((r) => getRef(runtime, (r as any).scope, (r as any).path))
      const val = b.formula?.expr ? evalFormula(b.formula.expr, ins) : ins[0]
      if (val !== undefined) out[prop] = val
    } catch (err) {
      console.warn(`[binding:${nodeId}.${prop}]`, err)
    }
  }
  return out
}

export function Slot({ nodes }: { nodes: Array<() => React.ReactNode> }) {
  return React.createElement(
    React.Fragment,
    null,
    nodes.map((N, i) => React.createElement(React.Fragment, { key: i }, N()))
  )
}

// Hover preset application (delegates to registry helper to avoid tight coupling)
export type HoverPresetMap = Record<string, { base?: React.CSSProperties; hover?: React.CSSProperties; transition?: string }>

export function applyHover(el: JSX.Element, hoverPresetId?: string, presets?: HoverPresetMap) {
  if (!hoverPresetId) return el
  const preset = presets?.[hoverPresetId]
  if (!preset) return el
  // lazy require to avoid circular ESM issues
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const REG = require('@chizu/registry')
  return REG.mergeHoverStyle(el, preset)
}

// Accept single or multiple preset ids; apply in order (later wins on overlaps)
export function applyHoverFlexible(
  el: JSX.Element,
  presetIdOrIds: string | string[] | undefined,
  presets?: HoverPresetMap
) {
  if (!presetIdOrIds) return el
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const REG = require('@chizu/registry')
  const ids = Array.isArray(presetIdOrIds) ? presetIdOrIds : [presetIdOrIds]
  let node = el
  for (const id of ids) {
    const p = presets?.[id]
    if (p) node = REG.mergeHoverStyle(node, p)
  }
  return node
}
