// apps/builder/app/dev/presets/page.tsx
'use client'
import React from 'react'
import PresetGallery from '@/components/presets/Gallery'

export default function Page() {
  return (
    <main className="p-4 space-y-3">
      <h1 className="text-lg font-semibold">Presets</h1>
      <PresetGallery />
    </main>
  )
}

