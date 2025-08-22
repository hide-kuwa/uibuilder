"use client"
import './globals.css'
import React, { ReactNode } from 'react'
import { HUDProvider } from '../components/hud/hudStore'
import PerfHUD from '@/components/dev/PerfHUD'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <HUDProvider>
          {children}
          {process.env.NODE_ENV !== 'production' && <PerfHUD />}
        </HUDProvider>
      </body>
    </html>
  )
}
