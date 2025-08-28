'use client'
import { useEffect } from 'react'
import { subscribeApply } from '@/lib/presetChannel'
import { useEditorStore } from '@/store/editorStore'
import { findNode } from '@/lib/tree'

function useApplyPresetToSelection() {
  const selectedIds = useEditorStore((s) => s.selectedIds || [])
  const updateNode = useEditorStore((s) => s.updateNode)

  return (presetId: string, mode: 'replace'|'append'|'remove') => {
    if (!selectedIds.length) return
    for (const id of selectedIds) {
      const node = findNode(useEditorStore.getState().tree, id)
      const cur: string[] =
        (node?.props?.presetIds as string[] | undefined) ||
        (node?.props?.presetId ? [node.props.presetId as string] : []) ||
        []
      let next = cur
      if (mode === 'replace') {
        next = [presetId]
      } else if (mode === 'append') {
        next = Array.from(new Set([...cur, presetId]))
      } else if (mode === 'remove') {
        next = cur.filter((x) => x !== presetId)
      }
      const props: any = { ...(node?.props || {}), presetIds: next }
      if (mode !== 'remove') props.presetId = presetId
      if (mode === 'remove' && cur.length <= 1) props.presetId = null
      updateNode(id, { props })
    }
  }
}

export function PresetApplyListener() {
  const apply = useApplyPresetToSelection()

  useEffect(() => {
    return subscribeApply((m) => apply(m.presetId, m.mode))
  }, [apply])

  return null
}
