// apps/builder/app/lineage.register.tsx
'use client'
import React from 'react'
import dynamic from 'next/dynamic'

const LineagePanel = dynamic(
  () => import('@/components/rightpane/LineagePanel').then(m => m.LineagePanel),
  { ssr: false }
)

declare global {
  interface Window {
    registerRightPaneTab?: (tab: { key: string; label: string; render: () => JSX.Element }) => void
    __chizuSel?: string
  }
}

export function RegisterLineageTabOnce() {
  React.useEffect(() => {
    if (!window.registerRightPaneTab) return
    const getSel = () => window.__chizuSel ?? 'sheet:交際費集計'
    const setSel = (id: string) => { window.__chizuSel = id }
    window.registerRightPaneTab({
      key: 'lineage',
      label: 'Lineage',
      render: () => <LineagePanel selectedId={getSel()} onSelect={setSel} title="Lineage" />,
    })
  }, [])
  return null
}

// --- append-only: Publish tab soft-register ---
const PublishPanel = dynamic(
  () => import('@/components/rightpane/PublishPanel').then(m => m.PublishPanel),
  { ssr: false }
)

if (typeof window !== 'undefined' && window.registerRightPaneTab) {
  const getSel = () => window.__chizuSel ?? 'sheet:交際費集計'
  window.registerRightPaneTab({
    key: 'publish',
    label: 'Publish',
    render: () => <PublishPanel nodeId={getSel()} />,
  })
}

// --- append-only: Reco tab soft-register ---
const RecoPanelLive = dynamic(
  () => import('@/components/rightpane/RecoPanelLive').then(m => m.RecoPanelLive),
  { ssr: false }
)

if (typeof window !== 'undefined' && window.registerRightPaneTab) {
  window.registerRightPaneTab({
    key: 'reco',
    label: 'Reco',
    render: () => <RecoPanelLive />,
  })
}

// --- append-only: Reco+ tab (tolerance UI) ---
import dynamic from 'next/dynamic'
const RecoPanelLivePlus = dynamic(
  () => import('@/components/rightpane/RecoPanelLivePlus').then(m => m.RecoPanelLivePlus),
  { ssr: false }
)

if (typeof window !== 'undefined' && window.registerRightPaneTab) {
  window.registerRightPaneTab({
    key: 'reco+',
    label: 'Reco+',
    render: () => <RecoPanelLivePlus />,
  })
}

// --- Snippets tab (append-only) ---
import dynamic from 'next/dynamic'
const BindingsSnippetsPanel = dynamic(
  () => import('@/components/rightpane/BindingsSnippetsPanel'),
  { ssr: false }
)

if (typeof window !== 'undefined' && (window as any).registerRightPaneTab) {
  (window as any).registerRightPaneTab?.({
    key: 'snippets',
    label: 'Snippets',
    render: () => <BindingsSnippetsPanel />
  })
}
