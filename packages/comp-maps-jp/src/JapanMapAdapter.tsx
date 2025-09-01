'use client'
import type { RendererProps } from '@repo/types'

function MockJapanMap({ values }: RendererProps) {
  return (
    <div className="w-full h-[480px] rounded-xl border border-border grid place-items-center text-muted">
      <div>JapanMap (mock)</div>
      <div className="text-xs opacity-70">labels: {String(values.showLabels)}</div>
    </div>
  )
}

export function JapanMapAdapter(p: RendererProps) {
  return <MockJapanMap {...p} />
}

