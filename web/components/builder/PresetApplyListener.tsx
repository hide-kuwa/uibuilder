'use client'

import { useEffect } from 'react'
import { subscribeApply } from '@/lib/presetChannel'
import { useInteractionRegistry } from '@/store/interactionRegistry'
import { useBuilderStore } from '@/store/builderStore'

function getAllNodeIds(root: HTMLElement) {
  return Array.from(root.querySelectorAll<HTMLElement>('[data-node-id]'))
    .map((el) => el.dataset.nodeId!)
    .filter(Boolean)
}

export default function PresetApplyListener({ canvasRef }: { canvasRef: React.RefObject<HTMLElement> }) {
  const { setProjectDefaults } = useInteractionRegistry()

  useEffect(() => {
    return subscribeApply((m) => {
      if (m.scope === 'set-project-default') {
        setProjectDefaults([m.presetId])
        return
      }

      const apply = (ids: string[]) => {
        ids.forEach((id) => {
          const node = useBuilderStore.getState().elements.find((e) => e.id === id)
          if (!node) return
          const cur =
            node.props?.presetIds ??
            (node.props?.presetId ? [node.props.presetId] : []) ??
            []
          let next = cur
          if (m.mode === 'replace') next = [m.presetId]
          if (m.mode === 'append') next = Array.from(new Set([...cur, m.presetId]))
          if (m.mode === 'remove') next = cur.filter((x) => x !== m.presetId)
          useBuilderStore.getState().updateProps(id, {
            presetIds: next,
            presetId: m.mode === 'remove' && next.length === 0 ? null : m.presetId,
          })
        })
      }

      const root = canvasRef.current || document.body
      if (!root) return
      if (m.scope === 'all') {
        apply(getAllNodeIds(root))
      } else {
        const sel = useBuilderStore.getState().selectedId
        if (sel) apply([sel])
      }
    })
  }, [canvasRef, setProjectDefaults])

  return null
}
