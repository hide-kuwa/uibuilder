'use client'
import React, { useEffect } from 'react'
import '../registry.entry'
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
import { mountHistorySync } from '@/store/historySync'
import StatusCenter from '@/components/hud/StatusCenter'
import ErrorBoundary from '@/components/hud/ErrorBoundary'
import DevConsoleHUD from '@/components/hud/DevConsoleHUD'
import ModalHost from '@/components/hud/ModalHost'

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  useAlignShortcuts()
  useEffect(() => { mountHistorySync() }, [])
  // Apply a global builder theme and hide site chrome on /builder
  useEffect(() => {
    const html = document.documentElement
    const body = document.body
    html.classList.add('builder-theme')
    body.classList.add('builder-theme', 'no-site-chrome')
    body.dataset.theme = 'compact'
    return () => {
      html.classList.remove('builder-theme')
      body.classList.remove('builder-theme', 'no-site-chrome')
      try { delete (body.dataset as any).theme } catch {}
    }
  }, [])
  return (
    <div data-actions-enabled="true" suppressHydrationWarning className="page-builder">
      <div className="w-full h-10 px-3 border-b flex items-center gap-3 builder-topbar topbar sticky top-0 z-40">
        <div className="text-sm font-semibold mr-auto">Builder</div>
        <UndoRedoButtons />
        <LoadFromGitHubMenu />
        <ProjectMetaMenu />
        <ShareMenu />
        <ReflectDeployMenu />
        <AlignToolbar />
        <SaveIndicator projectId="local" schemaVersion={1} />
      </div>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
      <StatusCenter />
      <HistoryHotkeys />
      {process.env.NODE_ENV !== 'production' && <DevConsoleHUD />}
      <ModalHost />
    </div>
  )
}
