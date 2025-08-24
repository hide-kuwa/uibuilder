import type { ComponentNode, EditorState, InstanceNode, OverrideMap } from '@/types/editor'
import { deepCloneNodeTree, findNode } from '@/lib/tree'

export function resolveOverrides(root: ComponentNode, overrides: OverrideMap = {}): ComponentNode {
  const clone = deepCloneNodeTree(root)
  const ov = overrides || {}

  if (ov.visible) {
    for (const [id, hidden] of Object.entries(ov.visible)) {
      const n = findNode(clone, id)
      if (n) (n as any).hidden = !!hidden
    }
  }
  if (ov.text) {
    for (const [id, v] of Object.entries(ov.text)) {
      const n = findNode(clone, id)
      if (n && (n as any).type === 'Text') (n as any).text = v.text
    }
  }
  if (ov.image) {
    for (const [id, v] of Object.entries(ov.image)) {
      const n = findNode(clone, id)
      if (n && (n as any).type === 'Image') (n as any).assetId = v.assetId
    }
  }
  if (ov.style) {
    for (const [id, s] of Object.entries(ov.style)) {
      const n = findNode(clone, id)
      if (n) Object.assign(((n as any).style ??= {}), s)
    }
  }
  return clone
}

export function resolveInstance(state: EditorState, inst: InstanceNode): ComponentNode | null {
  const def = state.components[inst.defId || (inst as any).componentId]
  if (!def) return null
  const baseRoot = findNode(state.tree, def.rootId)
  if (!baseRoot) return null
  let root = deepCloneNodeTree(baseRoot)
  if (inst.overrides) root = resolveOverrides(root, inst.overrides)
  ;(root as any).props = { ...(root as any).props, ...(inst as any).props }
  ;(root as any).opacity = (inst as any).opacity ?? (root as any).opacity
  ;(root as any).r = (inst as any).r ?? (root as any).r
  return root
}
