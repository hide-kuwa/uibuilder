"use client"
import './globals.css'
import React, { ReactNode } from 'react'
import { HUDProvider } from '../components/hud/hudStore'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <HUDProvider>{children}</HUDProvider>
      </body>
    </html>
  )
}
