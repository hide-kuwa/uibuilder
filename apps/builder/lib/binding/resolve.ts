// apps/builder/lib/binding/resolve.ts
import type { BindingSource } from '@/types/binding'
import type { EnvMode } from '@/stores/env'
import { getRuntimeForMode } from '@/lib/dataSources'
import type { Bindings, Binding as RendererBinding } from '@chizu/types'
import { resolveBinding as renderResolve } from '@chizu/renderer'

type ApiPreviewCacheEntry = { exp: number; data: any }
const apiPreviewCache = new Map<string, ApiPreviewCacheEntry>()
const apiPreviewPending = new Map<string, Promise<any>>()

type DataSourceMetaCache = { exp: number; ttlByKey: Map<string, number> }
let dataSourceMetaCache: DataSourceMetaCache | undefined

type RendererBindingsResult = {
  bindings: Bindings | undefined
  apiRuntime?: Record<string, any>
}

function extractApiKey(path: string): string | undefined {
  if (!path) return undefined
  const match = path.trim().match(/^([a-zA-Z0-9_-]+)/)
  return match?.[1]
}

async function loadDataSourceMeta(): Promise<Map<string, number>> {
  const now = Date.now()
  const cache = dataSourceMetaCache
  if (cache && cache.exp > now) return cache.ttlByKey
  if (typeof fetch !== 'function') {
    const ttlByKey = cache?.ttlByKey ?? new Map<string, number>()
    dataSourceMetaCache = { exp: now + 30_000, ttlByKey }
    return ttlByKey
  }
  try {
    const res = await fetch('/api/ds', { cache: 'no-store' })
    if (res.ok) {
      const json = (await res.json()) as { items?: Array<{ key?: string; ttlSec?: number }> }
      const ttlByKey = new Map<string, number>()
      for (const item of Array.isArray(json?.items) ? json.items : []) {
        if (!item || typeof item.key !== 'string') continue
        const ttlSec = typeof item.ttlSec === 'number' ? item.ttlSec : undefined
        const ttlMs = ttlSec && ttlSec > 0 ? ttlSec * 1000 : 0
        ttlByKey.set(item.key, ttlMs)
      }
      dataSourceMetaCache = { exp: now + 60_000, ttlByKey }
      return ttlByKey
    }
  } catch {}
  const ttlByKey = cache?.ttlByKey ?? new Map<string, number>()
  dataSourceMetaCache = { exp: now + 30_000, ttlByKey }
  return ttlByKey
}

async function fetchApiPreview(key: string): Promise<any> {
  const now = Date.now()
  const cached = apiPreviewCache.get(key)
  if (cached && cached.exp > now) return cached.data
  if (typeof fetch !== 'function') return null
  const pending = apiPreviewPending.get(key)
  if (pending) return pending
  const fetchPromise = (async () => {
    let data: any = null
    try {
      const res = await fetch(`/api/ds-preview?key=${encodeURIComponent(key)}`, { cache: 'no-store' })
      if (res.ok) {
        const json = (await res.json()) as { data?: any }
        data = json?.data ?? null
      }
    } catch {
      data = null
    }
    const ttlMap = await loadDataSourceMeta()
    const ttlMs = ttlMap.get(key) ?? 0
    if (ttlMs > 0) {
      apiPreviewCache.set(key, { exp: Date.now() + ttlMs, data })
    } else {
      apiPreviewCache.delete(key)
    }
    return data
  })()
  apiPreviewPending.set(key, fetchPromise)
  try {
    return await fetchPromise
  } finally {
    apiPreviewPending.delete(key)
  }
}

export async function toRendererBindings(map: Record<string, BindingSource | undefined>): Promise<RendererBindingsResult> {
  const entries = Object.entries(map).filter(([, v]) => v && v.path)
  if (entries.length === 0) return { bindings: undefined }
  const out: Record<string, RendererBinding> = {}
  const apiKeys = new Set<string>()
  for (const [prop, src] of entries) {
    if (!src) continue
    if (src.kind === 'local') {
      out[prop] = { inputs: [{ scope: 'page', path: src.path }] }
    } else if (src.kind === 'global') {
      out[prop] = { inputs: [{ scope: 'app', path: src.path }] }
    } else if (src.kind === 'api') {
      out[prop] = { inputs: [{ scope: 'api', path: src.path }] }
      const key = extractApiKey(src.path)
      if (key) apiKeys.add(key)
    }
  }
  const bindings = Object.keys(out).length ? (out as Bindings) : undefined
  let apiRuntime: Record<string, any> | undefined
  if (apiKeys.size > 0) {
    const pairs = await Promise.all(
      Array.from(apiKeys).map(async (key) => [key, await fetchApiPreview(key)] as const)
    )
    apiRuntime = {}
    for (const [key, data] of pairs) {
      apiRuntime[key] = data
    }
  }
  return { bindings, apiRuntime }
}

export async function resolvePropsWithBindings(
  nodeId: string,
  props: Record<string, any>,
  propBindings: Record<string, BindingSource | undefined>,
  mode: EnvMode,
  item?: any
) {
  const runtime = await getRuntimeForMode(mode)
  const { bindings, apiRuntime } = await toRendererBindings(propBindings)
  const runtimeWithApi = apiRuntime ? { ...runtime, api: { ...(runtime as any).api, ...apiRuntime } } : runtime
  const runtimeWithItem = item === undefined ? runtimeWithApi : { ...runtimeWithApi, item }
  return (renderResolve as any)(runtimeWithItem, nodeId, props, bindings as any)
}

// Bridge for preview runtime (optional)
declare global {
  interface Window { __resolvePropsWithBindings?: typeof resolvePropsWithBindings }
}

if (typeof window !== 'undefined' && !window.__resolvePropsWithBindings) {
  window.__resolvePropsWithBindings = resolvePropsWithBindings
}

// --- append-only: simple expression resolver for unit tests
// supports 'item.xxx' and nullish-coalescing like 'item.missing ?? 123'
export function resolveBinding(expr: string, ctx: any): any {
  const evalPath = (path: string) => {
    const parts = path.trim().split('.')
    let cur: any = ctx
    for (const seg of parts) {
      if (!seg) continue
      if (cur == null) return undefined
      cur = cur[seg]
    }
    return cur
  }
  if (expr.includes('??')) {
    const [l, r] = expr.split('??')
    const left = resolveBinding(l.trim(), ctx)
    if (left !== null && left !== undefined) return left
    const rhs = r.trim()
    try { return JSON.parse(rhs) } catch {}
    const num = Number(rhs)
    if (!Number.isNaN(num)) return num
    return rhs.replace(/^['"]|['"]$/g, '')
  }
  if (expr.startsWith('item.')) return evalPath(expr)
  return evalPath(expr)
}
