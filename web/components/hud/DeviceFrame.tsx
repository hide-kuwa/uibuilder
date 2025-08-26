'use client'
import React from 'react'
import { useHudStore } from '@/store/hudStore'

const widths: Record<string, number> = {
  desktop: 1280,
  tablet: 768,
  mobile: 390,
}

export function DeviceFrame({ children }: { children: React.ReactNode }) {
  const device = useHudStore((s) => s.device)

  if (device === 'free') return <>{children}</>

  const w = widths[device] ?? undefined
  return (
    <div className="w-full h-full flex justify-center">
      <div className="relative h-full" style={{ width: w }}>
        {children}
      </div>
    </div>
  )
}
