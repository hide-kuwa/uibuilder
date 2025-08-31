'use client'
import React, { useEffect, useMemo, useState } from 'react'
import { useBuilderStore } from '@/store/builderStore'
import { loadProjectFromQuery } from '@/lib/project/io'
import { NodeRendererCompat } from '@/components/NodeRendererCompat'
import { mountLiveSync } from '@/store/liveSync'
import ModalHost from '@/components/hud/ModalHost'
import { hydrateProjectStores } from '@/lib/project/loaders'

export default function PreviewPage() {
  const [ready, setReady] = useState(false)
  const elements = useBuilderStore((s) => s.elements)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const pj = await loadProjectFromQuery()
      if (mounted && pj) {
        hydrateProjectStores(pj)
      }
      mountLiveSync('preview')
      setReady(true)
    })()
    return () => { mounted = false }
  }, [])

  const roots = useMemo(() => (elements as any[]).filter((e) => !e.parentId), [elements])
  if (!ready) return null
  return (
    <div data-actions-enabled="true" suppressHydrationWarning className="w-full h-screen relative bg-black">
      {roots.map((n: any) => <NodeRendererCompat key={String(n.id)} node={n} />)}
      <ModalHost />
    </div>
  )
}
