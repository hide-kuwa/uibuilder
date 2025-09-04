'use client'
import React from 'react'
import { useViewport } from './ViewportStore'

const DEVICES: Record<string, { w: number; h: number }> = {
  mobile: { w: 375, h: 812 },
  tablet: { w: 768, h: 1024 },
  desktop: { w: 1280, h: 800 },
}

export default function DevicePreviewFrame({ children }: { children: React.ReactNode }) {
  const { vp } = useViewport()
  const spec = DEVICES[vp.device]
  if (!spec) return <>{children}</>
  return (
    <div className="w-full h-full flex justify-center items-start overflow-auto">
      <div
        className="relative bg-white shadow-md"
        style={{ width: spec.w, height: spec.h }}
      >
        {children}
      </div>
    </div>
  )
}
