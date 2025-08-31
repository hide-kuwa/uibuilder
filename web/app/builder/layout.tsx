'use client'
import '@/store/builderStoreHandle'
import { SaveIndicator } from '@/components/builder/SaveIndicator'
import { AlignToolbar } from '@/components/builder/AlignToolbar'
import { useAlignShortcuts } from '@/components/hooks/useAlignShortcuts'
import { ShareMenu } from '@/components/builder/ShareMenu'
import ErrorBoundary from '@/components/hud/ErrorBoundary'
import DevConsoleHUD from '@/components/hud/DevConsoleHUD'

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  useAlignShortcuts()
  return (
    <div data-actions-enabled="true" suppressHydrationWarning>
      <div className="w-full h-10 px-3 border-b flex items-center justify-between">
        <div className="text-sm font-semibold">Builder</div>
        <div className="flex items-center gap-3">
          <ShareMenu />
          <AlignToolbar />
          <SaveIndicator projectId="local" schemaVersion={1} />
        </div>
      </div>
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
      {process.env.NODE_ENV !== 'production' && <DevConsoleHUD />}
    </div>
  )
}

