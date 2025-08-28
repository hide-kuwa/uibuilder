'use client'

import React from 'react'

export function CanvasRoot({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full" data-actions-enabled="true">
      {children}
    </div>
  )
}

export default CanvasRoot
