'use client'
import React, { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HUDProvider } from '@/components/hud/hudStore'
import PerfHUD from '@/components/dev/PerfHUD'
import EventLog from '@/components/dev/EventLog'
import { ThemeProvider } from '@/lib/theme/ThemeProvider'
import DataProvider from '@/providers/DataProvider'

export default function Providers({ children, initialTheme }: { children: ReactNode; initialTheme: string }) {
  const [client] = React.useState(() => new QueryClient())
  return (
    <ThemeProvider initialTheme={initialTheme}>
      <DataProvider>
        <HUDProvider>
          <QueryClientProvider client={client}>
            {children}
            {process.env.NODE_ENV !== 'production' && (
              <>
                <PerfHUD />
                <EventLog />
                <ReactQueryDevtools initialIsOpen={false} />
              </>
            )}
          </QueryClientProvider>
        </HUDProvider>
      </DataProvider>
    </ThemeProvider>
  )
}
