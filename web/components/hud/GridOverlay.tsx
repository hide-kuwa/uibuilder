'use client'
import React from 'react'
import { useHudStore } from '@/store/hudStore'

export function GridOverlay() {
  const show = useHudStore((s) => s.showGrid)
  const zoom = useHudStore((s) => s.zoom)
  if (!show) return null

  // 基本ピッチ（8px）にズームを掛ける
  const minor = Math.max(1, 8 * zoom)
  // メジャーはマイナーの 5 倍間隔
  const major = minor * 5

  return (
    <div
      className="pointer-events-none absolute inset-0 z-40"
      style={{
        backgroundImage: `
          linear-gradient(0deg, rgba(148,163,184,0.12) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px),
          linear-gradient(0deg, rgba(148,163,184,0.3) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148,163,184,0.3) 1px, transparent 1px)
        `,
        backgroundSize: `
          ${minor}px ${minor}px,
          ${minor}px ${minor}px,
          ${major}px ${major}px,
          ${major}px ${major}px
        `,
      }}
    />
  )
}
