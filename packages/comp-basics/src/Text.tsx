'use client'
import type { RendererProps } from '@repo/types'

export function Text({ values }: RendererProps) {
  return (
    <div style={{ fontSize: values.size, color: values.color }}>
      {values.text}
    </div>
  )
}

