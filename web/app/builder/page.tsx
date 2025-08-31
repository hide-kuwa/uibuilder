'use client'
import React, { useEffect } from 'react'
import BuilderPage from './BuilderPage'
import { useBuilderStore } from '@/store/builderStore'
import { loadProjectFromQuery, makeProject, saveProject } from '@/lib/project/io'
import { mountLiveSync } from '@/store/liveSync'
import { useDesignTokens } from '@/store/designTokensStore'
import { useDataSources } from '@/store/dataBindingStore'

export default function BuilderPageWrapper() {
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const pj = await loadProjectFromQuery()
      if (mounted) {
        if (pj) {
          useBuilderStore.setState({ elements: pj.elements, meta: pj.meta || {} })
          useDesignTokens.getState().replaceAll(pj.designTokens || {})
          useDataSources.getState().replaceAll(pj.dataSources || {})
        } else {
          const init = makeProject([], { id: 'local', name: 'Local Project' }, useDesignTokens.getState().getAll(), useDataSources.getState().sources)
          useBuilderStore.setState({ elements: init.elements, meta: init.meta || {} })
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

  return <BuilderPage />
}
