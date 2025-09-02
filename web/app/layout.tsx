import './globals.css'
import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import Providers from './providers'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import ChromeController from '@/components/layout/ChromeController'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const uiTheme = cookieStore.get('ui-theme')?.value ?? 'light'

  return (
    <html lang="ja" data-theme={uiTheme} suppressHydrationWarning>
      <body>
        <Providers initialTheme={uiTheme}>
          <ChromeController />
          <SiteHeader />
          <main className="min-h-[calc(100vh-6rem)]">{children}</main>
          <SiteFooter />
        </Providers>
      </body>
    </html>
  )
}
