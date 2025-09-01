'use client'
import type { RendererProps } from '@repo/types'

export function Card({ children }: RendererProps) {
  return (
    <div className="rounded-xl border border-border bg-panel2 p-4">
      {children || (
        <div className="text-muted text-sm">Select a component in “Content”</div>
      )}
    </div>
  )
}

