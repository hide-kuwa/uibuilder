// apps/builder/app/builder/page.tsx
'use client'

import { Palette } from '@/components/palette/Palette'
import { CanvasRoot } from '@/components/canvas/CanvasRoot'
import { Inspector } from '@/components/inspector/Inspector'

export default function BuilderPage() {
  return (
    <div className="grid grid-cols-[240px_1fr_300px] h-screen">
      <div className="border-r p-2 overflow-y-auto">
        <Palette />
      </div>
      <div className="bg-gray-200 p-2 overflow-auto" data-testid="canvas-root">
        <CanvasRoot />
      </div>
      <div className="border-l p-2 overflow-y-auto">
        <Inspector />
      </div>
    </div>
  )
}
