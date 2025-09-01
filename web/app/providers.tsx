'use client'

import type { ReactNode } from 'react'
import { HUDProvider } from '@/components/hud/hudStore'
import PerfHUD from '@/components/dev/PerfHUD'
import EventLog from '@/components/dev/EventLog'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import DataProvider from '@/providers/DataProvider'

export default function Providers({ children, initialTheme }: { children: ReactNode; initialTheme: string }) {
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <DataProvider>
        <HUDProvider>
          {children}
          {process.env.NODE_ENV !== 'production' && (
            <>
              <PerfHUD />
              <EventLog />
            </>
          )}
        </HUDProvider>
      </DataProvider>
    </ThemeProvider>
  )
}
