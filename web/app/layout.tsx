import './globals.css'
import React, { ReactNode } from 'react'
import { cookies } from 'next/headers'
import { HUDProvider } from '../components/hud/hudStore'
import PerfHUD from '@/components/dev/PerfHUD'
import EventLog from '@/components/dev/EventLog'
import { ThemeProvider } from '../lib/theme/ThemeProvider'
import DataProvider from '@/providers/DataProvider'

export default function RootLayout({ children }: { children: ReactNode }) {
  const theme = cookies().get('ui-theme')?.value ?? 'light'

  return (
    <html lang="en" data-theme={theme} suppressHydrationWarning>
      <body>
        <ThemeProvider>
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
      </body>
    </html>
  )
}
