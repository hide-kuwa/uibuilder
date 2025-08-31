'use client'
import React, { useEffect } from 'react'
import BuilderPage from './BuilderPage'
import { useBuilderStore } from '@/store/builderStore'
import { loadProjectFromQuery, makeProject, saveProject } from '@/lib/project/io'
import { mountLiveSync } from '@/store/liveSync'

export default function BuilderPageWrapper() {
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const pj = await loadProjectFromQuery()
      if (mounted) {
        if (pj) useBuilderStore.setState({ elements: pj.elements, meta: pj.meta || {} })
        else
          useBuilderStore.setState({
            elements: makeProject([], { id: 'local', name: 'Local Project' }).elements,
            meta: { id: 'local', name: 'Local Project' },
          })
      }
      mountLiveSync('builder')
    })()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const unsub = useBuilderStore.subscribe((s) => {
      const meta = (s as any).meta || { id: 'local', name: 'Local Project' }
      saveProject({ schemaVersion: 1, meta, elements: s.elements, designTokens: {}, assets: [] })
    })
    return () => unsub()
  }, [])

  return <BuilderPage />
}
