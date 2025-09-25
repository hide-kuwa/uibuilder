// apps/builder/app/lineage.register.tsx
'use client'
import React from 'react'
import dynamic from 'next/dynamic'
import { ENABLE_PALETTE_V1 } from '@/lib/flags'

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
import DynRecoPlus from 'next/dynamic'
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
import DynSnippets from 'next/dynamic'
const BindingsSnippetsPanel = DynSnippets(
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

// --- append-only: DS+ tab registration ---
import DynDsPlus from 'next/dynamic'
import { useEffect } from 'react'
import * as React2 from 'react' // avoid duplicate React name

export function RegisterDsTestPlusTabOnce() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    // idempotent guard
    if ((window as any).__tab_dsplus_registered) return
    ;(window as any).__tab_dsplus_registered = true
    const Lazy = DynDsPlus(() => import('@/components/rightpane/DsTestPanelPlus'), { ssr: false })
    // support object-based register as used elsewhere
    if (typeof window.registerRightPaneTab === 'function') {
      try {
        ;(window as any).registerRightPaneTab?.({ key: 'ds+', label: 'DS+', render: () => <Lazy /> })
      } catch {
        try { (window as any).registerRightPaneTab?.('ds+', 'DS+', () => <Lazy />) } catch {}
      }
    }
  }, [])
  return null
}

// --- DS Test tab (append-only) ---
import DynDs from 'next/dynamic'
const DsTestPanel = DynDs(() => import('@/components/rightpane/DsTestPanel'), { ssr: false })

export function RegisterDsTestTabOnce() {
  React.useEffect(() => {
    const w = window as any
    if (w.__dsTestTabRegistered) return
    w.__dsTestTabRegistered = true
    if (typeof w.registerRightPaneTab === 'function') {
      w.registerRightPaneTab?.({
        key: 'ds',
        label: 'DS',
        render: () => <DsTestPanel />
      })
    }
  }, [])
  return null
}
/**
 * [append-only] Idempotent register pattern for right-pane tabs
 *
 * ▷ 目的：ブラウザの再マウントやホットリロード時でも「タブ登録」が重複しない安心感を担保する。
 * ▷ ルール：
 *   - グローバルに `window.__tab_<id>_registered` を置く（boolean）
 *   - true の場合は registerRightPaneTab を再実行しない
 *   - registerRightPaneTab は 2 形態を許容：
 *       1) オブジェクト：{ id, title, component }
 *       2) 3引数：registerRightPaneTab(id, title, component)
 * ▷ 実装例：RegisterDsTestPlusTabOnce() 内で上記ガードを確認してから登録する
 * ▷ 追記のみ：既存行は変更しない（本ブロックはドキュメント用途）
*/

// --- append-only: Guide tab (UI-Audit fixes) ---
import DynGuide from 'next/dynamic'
const GuidePanel = DynGuide(() => import('@/components/rightpane/GuidePanel'), { ssr: false })

if (typeof window !== 'undefined' && (window as any).registerRightPaneTab) {
  ;(window as any).registerRightPaneTab?.({
    key: 'guide',
    label: 'Guide',
    render: () => <GuidePanel />,
  })
}

// --- append-only: Data tab (bindings) ---
import DynData from 'next/dynamic'
const DataPanel = DynData(() => import('@/components/rightpane/DataPanel'), { ssr: false })

if (typeof window !== 'undefined' && (window as any).registerRightPaneTab) {
  ;(window as any).registerRightPaneTab?.({
    key: 'data',
    label: 'Data',
    render: () => <DataPanel />,
  })
}

// --- append-only: Presets tab ---
import DynPresets from 'next/dynamic'
const PresetsPanel = DynPresets(() => import('@/components/rightpane/PresetsPanel'), { ssr: false })

if (typeof window !== 'undefined' && (window as any).registerRightPaneTab) {
  ;(window as any).registerRightPaneTab?.({ key: 'presets', label: 'Presets', render: () => <PresetsPanel /> })
}

// --- append-only: Interactions tab ---
import DynInteractions from 'next/dynamic'
const InteractionsTab = DynInteractions(
  () => import('@/components/rightpane/InteractionsTab'),
  { ssr: false },
)

if (typeof window !== 'undefined' && (window as any).registerRightPaneTab) {
  ;(window as any).registerRightPaneTab?.({
    key: 'interactions',
    label: 'Interactions',
    render: () => <InteractionsTab />,
  })
}

// --- append-only: Palette left-pane tab (feature-flagged) ---
if (ENABLE_PALETTE_V1 && typeof window !== 'undefined') {
  void import('@/components/leftpane/PaletteTab')
}

// --- append-only: mark alias imports as “used” to satisfy some ESLint configs ---
// 一部の設定では DynRecoPlus/DynSnippets/DynDsPlus/DynDs を未使用とみなすことがあるため、
// 無害な参照を置いて警告を抑制する（実行副作用なし）。
;(() => {
  void DynRecoPlus
  void DynSnippets
  void DynDsPlus
  void DynDs
  void DynInteractions
})()

// append-only: register canonical insert and history bridges
import { registerInsertAPI } from '@/lib/bridge/insert'
import { insertNode as canonicalInsert } from '@/stores/insert'
registerInsertAPI(canonicalInsert as any)

// optional: if you have a real history API, register it here
// import { pushInsert as realPushInsert } from '<path-to-history-api>'
// import { registerHistoryInsert } from '@/lib/history/bridge'
// registerHistoryInsert(realPushInsert)
