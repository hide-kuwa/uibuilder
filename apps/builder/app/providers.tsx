'use client'

import type { ReactNode } from 'react'
import '@/lib/palette/canary'

export function Providers({ children }: { children: ReactNode }) {
  return <>{children}</> 
}