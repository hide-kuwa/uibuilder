// apps/builder/app/dev/export/page.tsx
'use client'
import React from 'react'
import { ExportButton } from '@/components/ExportButton'
// --- append-only: autosave mount import ---
import { AutosaveMount } from '@/components/AutosaveMount'
import { ExportButtonDeterministic } from '@/components/ExportButtonDeterministic'
import { ExportHashPreview } from '@/components/ExportHashPreview'

export default function Page() {
  // TODO: replace with builder store; temporary dummy
  const getPage = () => ({ id: 'sample', title: 'Sample', content: [] })
  return (
    <main className="p-6 space-y-3">
      <h1 className="text-lg font-semibold">Export (dev)</h1>
      <ExportButton getPage={getPage} />
      {/* --- append-only: autosave mount --- */}
      <AutosaveMount page={getPage()} />
      <div style={{ marginTop: 16 }}>
        <ExportButtonDeterministic page={getPage()} />
      </div>
      <ExportHashPreview page={getPage()} />
      <p className="text-sm opacity-70">※ ストア接続前の暫定版です。</p>
    </main>
  )
}
