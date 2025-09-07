// apps/builder/app/dev/export/page.tsx
'use client'
import React from 'react'
import { ExportButton } from '@/components/ExportButton'

export default function Page() {
  // TODO: replace with builder store; temporary dummy
  const getPage = () => ({ id: 'sample', title: 'Sample', content: [] })
  return (
    <main className="p-6 space-y-3">
      <h1 className="text-lg font-semibold">Export (dev)</h1>
      <ExportButton getPage={getPage} />
      <p className="text-sm opacity-70">※ ストア接続前の暫定版です。</p>
    </main>
  )
}

