'use client'
export const dynamic = 'force-dynamic'
import '../registry.entry';
import React, { useEffect } from 'react'
import BuilderPage from './BuilderPage'
import ClientOnly from '@/components/ClientOnly'
import Sidebar from '@/components/layout/Sidebar'
import { useBuilderStore } from '@/store/builderStore'
import { loadProjectFromQuery, makeProject, saveProject } from '@/lib/project/io'
import { mountLiveSync } from '@/store/liveSync'
import { useDesignTokens } from '@/store/designTokensStore'
import { useDataSources } from '@/store/dataBindingStore'
import { hydrateProjectStores } from '@/lib/project/loaders'

export default function BuilderPageWrapper() {
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const pj = await loadProjectFromQuery()
      if (mounted) {
        if (pj) {
          hydrateProjectStores(pj)
        } else {
          const init = makeProject([], { id: 'local', name: 'Local Project' }, useDesignTokens.getState().getAll(), useDataSources.getState().sources)
          hydrateProjectStores(init)
        }
      }
      mountLiveSync('builder')
    })()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const unsub1 = useBuilderStore.subscribe((s) => {
      const meta = (s as any).meta || { id: 'local', name: 'Local Project' }
      const tokens = useDesignTokens.getState().getAll()
      const data = useDataSources.getState().sources
      saveProject({ schemaVersion: 1, meta, elements: s.elements, designTokens: tokens, dataSources: data, assets: [] })
    })
    const unsub2 = useDesignTokens.subscribe(() => {
      const s = useBuilderStore.getState()
      const meta = (s as any).meta || { id: 'local', name: 'Local Project' }
      const tokens = useDesignTokens.getState().getAll()
      const data = useDataSources.getState().sources
      saveProject({ schemaVersion: 1, meta, elements: s.elements, designTokens: tokens, dataSources: data, assets: [] })
    })
    const unsub3 = useDataSources.subscribe(() => {
      const s = useBuilderStore.getState()
      const meta = (s as any).meta || { id: 'local', name: 'Local Project' }
      const tokens = useDesignTokens.getState().getAll()
      const data = useDataSources.getState().sources
      saveProject({ schemaVersion: 1, meta, elements: s.elements, designTokens: tokens, dataSources: data, assets: [] })
    })
    return () => { unsub1(); unsub2(); unsub3() }
  }, [])

  return (
    <ClientOnly fallback={null}>
      <div className="flex h-[calc(100vh-40px)]">
        <Sidebar />
        <div className="flex-1">
          <BuilderPage />
        </div>
      </div>
    </ClientOnly>
  )
}
