'use client'
import React, { useEffect } from 'react'
import { decodeShare } from '@/lib/share'
import { useBuilderStore } from '@/store/builderStore'
import BuilderPage from './BuilderPage'

export default function BuilderPageWrapper() {
  useEffect(() => {
    const p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    const d = p.get('d')
    if (d) {
      const data = decodeShare(d)
      if (data?.elements) {
        useBuilderStore.setState({ elements: data.elements, tree: data.elements, meta: data.meta ?? {} })
      }
    }
  }, [])
  return <BuilderPage />
}
