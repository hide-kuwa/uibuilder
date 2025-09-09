// apps/builder/lib/binding/resolve.ts
import type { BindingSource } from '@/types/binding'
import type { EnvMode } from '@/stores/env'
import { getRuntimeForMode } from '@/lib/dataSources'
import type { Bindings } from '@chizu/types'
import { resolveBinding as renderResolve } from '@chizu/renderer'

export function toRendererBindings(map: Record<string, BindingSource | undefined>): Bindings | undefined {
  const entries = Object.entries(map).filter(([, v]) => v && v.path)
  if (entries.length === 0) return undefined
  const out: any = {}
  for (const [prop, src] of entries) {
    if (!src) continue
    out[prop] = { inputs: [{ scope: src.kind === 'local' ? 'page' : 'app', path: src.path }] }
  }
  return out
}

export async function resolvePropsWithBindings(
  nodeId: string,
  props: Record<string, any>,
  propBindings: Record<string, BindingSource | undefined>,
  mode: EnvMode,
  item?: any
) {
  const runtime = await getRuntimeForMode(mode)
  const runtimeWithItem = item === undefined ? runtime : { ...runtime, item }
  const b = toRendererBindings(propBindings)
  return renderResolve(runtimeWithItem, nodeId, props, b as any)
}

// Bridge for preview runtime (optional)
declare global {
  interface Window { __resolvePropsWithBindings?: typeof resolvePropsWithBindings }
}

if (typeof window !== 'undefined' && !window.__resolvePropsWithBindings) {
  window.__resolvePropsWithBindings = resolvePropsWithBindings
}
