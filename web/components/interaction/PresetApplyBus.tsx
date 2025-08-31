'use client'
import * as React from 'react'
import { subscribeApply, type ApplyMode } from '@/lib/presetChannel'
import { applyPresetToSelection, applyPresetToAll } from '@/store/editorStore'
import { useInteractionRegistry } from '@/store/interactionRegistry'
import { useEditorStore } from '@/store/editorStore'
import { normalizeNodePresets } from '@/lib/presetApply'

export default function PresetApplyBus() {
  React.useEffect(() => {
    // sync legacy preset props on mount
    const st = useEditorStore.getState()
    st.tree.forEach((n: any) => {
      const ids = normalizeNodePresets(n)
      const props = n.props || {}
      if (!Array.isArray(props.presetIds) || ids.length !== props.presetIds.length || ids.some((x, i) => x !== props.presetIds[i]) || props.presetId !== ids[0]) {
        st.updateNode(n.id, { props: { ...props, presetIds: ids, presetId: ids[0] ?? null } })
      }
    })
  }, [])

  React.useEffect(() => {
    return subscribeApply((m) => {
      if (m.type !== 'apply') return
      const { presetId, mode, scope } = m
      if (scope === 'selection') applyPresetToSelection(presetId, mode as ApplyMode)
      else if (scope === 'all') applyPresetToAll(presetId, mode as ApplyMode)
      else if (scope === 'set-project-default') {
        const r = useInteractionRegistry.getState()
        const ids = presetId ? [presetId] : []
        r.setProjectDefaults(ids)
      }
    })
  }, [])
  return null
}
