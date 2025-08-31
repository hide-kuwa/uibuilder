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
import HistoryHotkeys from '@/components/hud/HistoryHotkeys'
import { mountHistorySync } from '@/store/historySync'
import StatusCenter from '@/components/hud/StatusCenter'
import ErrorBoundary from '@/components/hud/ErrorBoundary'
import DevConsoleHUD from '@/components/hud/DevConsoleHUD'

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  useAlignShortcuts()
  useEffect(() => { mountHistorySync() }, [])
  return (
    <div data-actions-enabled="true" suppressHydrationWarning>
      <div className="w-full h-10 px-3 border-b flex items-center gap-3">
        <div className="text-sm font-semibold mr-auto">Builder</div>
        <UndoRedoButtons />
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
    </div>
  )
}
