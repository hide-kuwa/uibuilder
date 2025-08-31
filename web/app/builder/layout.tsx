'use client'
import '@/store/builderStoreHandle'
import { SaveIndicator } from '@/components/builder/SaveIndicator'
import { AlignToolbar } from '@/components/builder/AlignToolbar'
import { useAlignShortcuts } from '@/components/hooks/useAlignShortcuts'
import { ShareMenu } from '@/components/builder/ShareMenu'
import ReflectDeployMenu from '@/components/builder/ReflectDeployMenu'

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  useAlignShortcuts()
  return (
    <div data-actions-enabled="true">
      <div className="w-full h-10 px-3 border-b flex items-center justify-between">
        <div className="text-sm font-semibold">Builder</div>
        <div className="flex items-center gap-3">
          <ShareMenu />
          <ReflectDeployMenu />
          <AlignToolbar />
          <SaveIndicator projectId="local" schemaVersion={1} />
        </div>
      </div>
      {children}
    </div>
  )
}

