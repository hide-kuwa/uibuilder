'use client'
import React, { useEffect } from 'react'
import { useEditorActions } from './store'
import { apiFetch } from '../lib/api'

const PAGE_ID = 'home'

const LoadInitialTree: React.FC = () => {
  const { loadTemplate } = useEditorActions()
  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch(`/edge-config/${PAGE_ID}`)
        const next = Array.isArray((data as any).children) ? (data as any).children : []
        if (next.length) loadTemplate(next)
      } catch {
        // silent
      }
    })()
  }, [loadTemplate])
  return null
}

export default LoadInitialTree

