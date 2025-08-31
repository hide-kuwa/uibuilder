'use client'
import { useEditorStore } from '@/store/editorStore'

export type ApplyMode = 'replace' | 'append' | 'remove'

export function normalizeNodePresets(node: any) {
  const ids = Array.isArray(node?.props?.presetIds)
    ? (node.props.presetIds as string[])
    : node?.props?.presetId
      ? [node.props.presetId]
      : []
  return Array.from(new Set(ids))
}

export function buildNextPresetIds(cur: string[], mode: ApplyMode, id: string) {
  if (mode === 'replace') return id ? [id] : []
  if (mode === 'append') return Array.from(new Set([...cur, id].filter(Boolean)))
  if (mode === 'remove') return cur.filter((x) => x !== id)
  return cur
}

export function applyPresetToNode(nodeId: string, presetId: string | null, mode: ApplyMode) {
  const st = useEditorStore.getState()
  const node = st.tree.find((n: any) => n.id === nodeId)
  if (!node) return
  const cur = normalizeNodePresets(node)
  const next = presetId
    ? buildNextPresetIds(cur, mode, presetId)
    : mode === 'replace'
      ? []
      : cur
  const patch: any = { ...(node.props || {}), presetIds: next }
  patch.presetId = next[0] ?? null // keep legacy in sync
  st.updateNode(nodeId, { props: patch })
}
