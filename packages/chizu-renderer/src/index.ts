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
