'use client'
import { useEffect } from 'react'
import { subscribeApply } from '@/lib/presetChannel'
import { useInteractionRegistry } from '@/store/interactionRegistry'
import { useEditorStore } from '@/store/editorStore'
import { findNode } from '@/lib/tree'

function getAllNodeIdsFromDOM(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-node-id]'))
    .map(el => el.dataset.nodeId!)
    .filter(Boolean)
}

function applyIds(ids: string[], presetId: string, mode: 'replace'|'append'|'remove') {
  const updateNode = useEditorStore.getState().updateNode
  const tree = useEditorStore.getState().tree
  ids.forEach((id) => {
    const node = findNode(tree, id) as any
    const cur: string[] =
      node?.props?.presetIds ??
      (node?.props?.presetId ? [node.props.presetId] : []) ??
      []
    let next = cur
    if (mode === 'replace') next = [presetId]
    if (mode === 'append') next = Array.from(new Set([...cur, presetId]))
    if (mode === 'remove') next = cur.filter(x => x !== presetId)
    const props: any = { ...(node?.props || {}), presetIds: next }
    if (mode !== 'remove') props.presetId = presetId
    if (mode === 'remove' && cur.length <= 1) props.presetId = null
    updateNode(id, { props })
  })
}

export function PresetApplyListener({ canvasRef }:{ canvasRef: React.RefObject<HTMLElement> }) {
  const { setProjectDefaults } = useInteractionRegistry()
  useEffect(() => {
    return subscribeApply((m) => {
      if (m.scope === 'set-project-default') {
        setProjectDefaults([m.presetId])
        return
      }
      const root = canvasRef.current || document.body
      if (!root) return
      if (m.scope === 'all') {
        applyIds(getAllNodeIdsFromDOM(root), m.presetId, m.mode)
      } else {
        const selected = (useEditorStore.getState().selectedIds as string[]) || []
        if (selected.length) applyIds(selected, m.presetId, m.mode)
      }
    })
  }, [canvasRef, setProjectDefaults])
  return null
}
