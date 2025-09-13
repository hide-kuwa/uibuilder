'use client'
import React, { useEffect } from 'react'
import '@/store/builderStoreHandle'
import { SaveIndicator } from '@/components/builder/SaveIndicator'
import { AlignToolbar } from '@/components/builder/AlignToolbar'
import { useAlignShortcuts } from '@/components/hooks/useAlignShortcuts'
import { ShareMenu } from '@/components/builder/ShareMenu'
import ReflectDeployMenu from '@/components/builder/ReflectDeployMenu'
import ProjectMetaMenu from '@/components/builder/ProjectMetaMenu'
import UndoRedoButtons from '@/components/builder/UndoRedoButtons'
import LoadFromGitHubMenu from '@/components/builder/LoadFromGitHubMenu'
import HistoryHotkeys from '@/components/hud/HistoryHotkeys'
import HistoryTimeline from '@/components/hud/HistoryTimeline'
import { mountHistorySync } from '@/store/historySync'
import StatusCenter from '@/components/hud/StatusCenter'
import ErrorBoundary from '@/components/hud/ErrorBoundary'
import DevConsoleHUD from '@/components/hud/DevConsoleHUD'
import ModalHost from '@/components/hud/ModalHost'
import SkipToCanvasLink from '@/components/a11y/SkipToCanvasLink'
import LangSwitcher from '@/components/actions/LangSwitcher'
import SelectionCssBridge from '@/components/bridges/SelectionCssBridge'

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  useAlignShortcuts()
  useEffect(() => { mountHistorySync() }, [])
  useEffect(() => {
    document.body.classList.add('no-site-chrome')
    return () => document.body.classList.remove('no-site-chrome')
  }, [])
  return (
    <div data-actions-enabled="true" suppressHydrationWarning>
      <div className="w-full h-10 px-3 border-b flex items-center gap-3">
        <div className="text-sm font-semibold mr-auto">Builder</div>
        <LangSwitcher />
        <UndoRedoButtons />
        <LoadFromGitHubMenu />
        <ProjectMetaMenu />
        <ShareMenu />
        <ReflectDeployMenu />
        <AlignToolbar />
        <SaveIndicator projectId="local" schemaVersion={1} />
      </div>
      <ErrorBoundary>
        <SkipToCanvasLink />
        {children}
      </ErrorBoundary>
      <SelectionCssBridge />
      <StatusCenter />
      <HistoryHotkeys />
      <HistoryTimeline />
      {process.env.NODE_ENV !== 'production' && <DevConsoleHUD />}
      <ModalHost />
    </div>
  )
}
