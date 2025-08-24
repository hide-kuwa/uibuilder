import { EditorState, ComponentNode } from '@/types/editor'
import { findNode } from '@/lib/tree'

export interface CompatReport {
  ok: boolean
  reason?: string
  map: Record<string, string>
}

/**
 * Build mapping from old node ids to new node ids based on stableKey or name.
 */
export function mapNodesForSwap(
  state: EditorState,
  oldRootId: string,
  newRootId: string,
): CompatReport {
  const oldRoot = findNode(state.tree, oldRootId) as any
  const newRoot = findNode(state.tree, newRootId) as any
  if (!oldRoot || !newRoot) return { ok: false, reason: 'root missing', map: {} }

  const map: Record<string, string> = {}
  const indexByKey = new Map<string, string>() // key -> newId
  const indexByName = new Map<string, string[]>() // name -> newIds

  const walk = (n: ComponentNode | undefined) => {
    if (!n) return
    const key = (n as any).stableKey
    if (key) indexByKey.set(key, n.id)
    if (n.name) {
      const arr = indexByName.get(n.name) || []
      arr.push(n.id)
      indexByName.set(n.name, arr)
    }
    for (const c of n.children || []) walk(c as any)
  }
  walk(newRoot)

  const walkOld = (n: ComponentNode | undefined) => {
    if (!n) return
    let target: string | undefined
    const key = (n as any).stableKey
    if (key) target = indexByKey.get(key)
    if (!target && n.name) {
      const arr = indexByName.get(n.name)
      if (arr && arr.length) target = arr.shift()
    }
    if (target) map[n.id] = target
    for (const c of n.children || []) walkOld(c as any)
  }
  walkOld(oldRoot)

  return { ok: true, map }
}

export function isCompatible(
  state: EditorState,
  oldRootId: string,
  newRootId: string,
): boolean {
  return mapNodesForSwap(state, oldRootId, newRootId).ok
}
