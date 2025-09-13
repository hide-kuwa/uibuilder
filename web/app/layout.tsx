import './globals.css'
import type { ReactNode } from 'react'
import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import Providers from './providers'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import ChromeController from '@/components/layout/ChromeController'
import ErrorBoundary from '@/components/ErrorBoundary'
import RootHotkeys from '@/components/RootHotkeys'

export const metadata: Metadata = {
  manifest: '/manifest.json',
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const uiTheme = cookieStore.get('ui-theme')?.value ?? 'light'

  return (
    <html lang="ja" data-theme={uiTheme} suppressHydrationWarning>
      <body>
        <ErrorBoundary>
          <Providers initialTheme={uiTheme}>
            <ChromeController />
            <RootHotkeys />
            <SiteHeader />
            <main className="min-h-[calc(100vh-6rem)]">{children}</main>
            <SiteFooter />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
