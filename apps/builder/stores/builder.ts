'use client'
import { create } from 'zustand'
import type { BindingSource } from '@/types/binding'

export type NodePropBindings = Record<string, BindingSource | undefined>

type BuilderState = {
  selectedNodeId?: string
  // nodeId -> propId -> BindingSource
  propBindings: Record<string, NodePropBindings>
  selectNode: (id?: string) => void
  setBinding: (nodeId: string, propId: string, src?: BindingSource) => void
  getBindingsForNode: (nodeId: string) => NodePropBindings
}

export const useBuilderStore = create<BuilderState>((set, get) => ({
  selectedNodeId: undefined,
  propBindings: {},
  selectNode(id) {
    set({ selectedNodeId: id })
  },
  setBinding(nodeId, propId, src) {
    const cur = { ...(get().propBindings[nodeId] || {}) }
    cur[propId] = src
    set({ propBindings: { ...get().propBindings, [nodeId]: cur } })
    // notify preview
    try { window.dispatchEvent(new CustomEvent('bindings:changed', { detail: { nodeId, propId, src } })) } catch {}
  },
  getBindingsForNode(nodeId) {
    return get().propBindings[nodeId] || {}
  },
}))

// --- append-only: Repeat wrap/unwrap helpers and event handlers ---
function deepClone<T>(x: T): T { try { return structuredClone(x) } catch { return JSON.parse(JSON.stringify(x)) } }

function locateWithParent(root: any, targetId: string): { parent: any | null; index: number } {
  let result: { parent: any | null; index: number } = { parent: null, index: -1 }
  const visit = (n: any) => {
    const ch: any[] = Array.isArray(n?.children) ? n.children : []
    for (let i = 0; i < ch.length; i++) {
      if (ch[i]?.id === targetId) { result = { parent: n, index: i }; return }
      visit(ch[i])
    }
  }
  visit(root)
  return result
}

function newId() { return 'n_' + Math.random().toString(36).slice(2, 8) }

export function wrapRepeat(tree: any, nodeId: string, dataPath: string, itemKey?: string) {
  const draft = deepClone(tree)
  const { parent, index } = locateWithParent(draft, nodeId)
  if (!parent || index < 0) return draft
  const target = parent.children[index]
  const wrapper = { id: newId(), kind: 'Repeat', dataPath, itemKey, children: [target] }
  parent.children.splice(index, 1, wrapper)
  return draft
}

export function unwrapRepeat(tree: any, nodeId: string) {
  const draft = deepClone(tree)
  const { parent, index } = locateWithParent(draft, nodeId)
  const node = parent?.children?.[index]
  if (!parent || index < 0 || !node || node.kind !== 'Repeat') return draft
  parent.children.splice(index, 1, ...(node.children ?? []))
  return draft
}

// Event wiring: handle DataPanel wrap/unwrap events; save and refresh score
if (typeof window !== 'undefined') {
  const applyWrap = async (e: Event) => {
    try {
      const det: any = (e as CustomEvent).detail
      const nodeId: string = det?.nodeId
      const dataPath: string = det?.dataPath
      const itemKey: string | undefined = det?.itemKey
      const slug = new URLSearchParams(window.location.search).get('slug') || 'sample'
      const r = await fetch(`/pages/${encodeURIComponent(slug)}.json`, { cache: 'no-store' })
      const cur = await r.json()
      const tree = Array.isArray(cur?.tree) ? cur.tree : Array.isArray(cur) ? cur : []
      const next = wrapRepeat(tree, nodeId, dataPath, itemKey)
      // Save debounced
      try { (await import('@/lib/save/applyAndSave')).saveDebounced(slug, next) } catch {}
      // Refresh score
      try { await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' }) } catch {}
    } catch {}
  }
  const applyUnwrap = async (e: Event) => {
    try {
      const det: any = (e as CustomEvent).detail
      const nodeId: string = det?.nodeId
      const slug = new URLSearchParams(window.location.search).get('slug') || 'sample'
      const r = await fetch(`/pages/${encodeURIComponent(slug)}.json`, { cache: 'no-store' })
      const cur = await r.json()
      const tree = Array.isArray(cur?.tree) ? cur.tree : Array.isArray(cur) ? cur : []
      const next = unwrapRepeat(tree, nodeId)
      try { (await import('@/lib/save/applyAndSave')).saveDebounced(slug, next) } catch {}
      try { await fetch(`/api/ui-audit/score?slug=${encodeURIComponent(slug)}`, { cache: 'no-store' }) } catch {}
    } catch {}
  }
  window.addEventListener('builder:wrapRepeat', applyWrap as any)
  window.addEventListener('builder:unwrapRepeat', applyUnwrap as any)
}

