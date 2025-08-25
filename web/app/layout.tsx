"use client"
import './globals.css'
import React, { ReactNode } from 'react'
import { HUDProvider } from '../components/hud/hudStore'
import PerfHUD from '@/components/dev/PerfHUD'
import EventLog from '@/components/dev/EventLog'
import { ThemeProvider, ThemeScript } from '../lib/theme/ThemeProvider'
import DataProvider from '@/providers/DataProvider'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ThemeScript />
      </head>
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
