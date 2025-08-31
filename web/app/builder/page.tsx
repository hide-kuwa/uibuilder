'use client'
import React, { useEffect } from 'react'
import BuilderPage from './BuilderPage'
import { useBuilderStore } from '@/store/builderStore'
import { loadProjectFromQuery, makeProject } from '@/lib/project/io'
import { mountLiveSync } from '@/store/liveSync'
import { useDesignTokens } from '@/store/designTokensStore'
import { useHistoryStore } from '@/store/historyStore'

export default function BuilderPageWrapper() {
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const pj = await loadProjectFromQuery()
      if (mounted) {
        if (pj) {
          useBuilderStore.setState({ elements: pj.elements, meta: pj.meta || {} })
          useDesignTokens.getState().replaceAll?.(pj.designTokens || {})
        } else {
          useBuilderStore.setState({
            elements: makeProject([], { id: 'local', name: 'Local Project' }).elements,
            meta: { id: 'local', name: 'Local Project' },
          })
          useDesignTokens.getState().replaceAll?.({})
        }
        useHistoryStore.getState().initFromCurrent()
      }
      mountLiveSync('builder')
    })()
    return () => {
      mounted = false
    }
  }, [])

  return <BuilderPage />
}
