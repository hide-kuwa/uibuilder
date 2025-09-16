import './globals.css'
import type { ReactNode } from 'react'
import { cookies } from 'next/headers'
import Script from 'next/script'
import Providers from './providers'
import SiteHeader from '@/components/layout/SiteHeader'
import SiteFooter from '@/components/layout/SiteFooter'
import ChromeController from '@/components/layout/ChromeController'
import ErrorBoundary from '@/components/ErrorBoundary'
import RootHotkeys from '@/components/RootHotkeys'
import DiagnosticsConsole from '@/components/dev/DiagnosticsConsole'
import { DIAGNOSTICS_EVENT_NAME, isDiagnosticsEnabled } from '@/lib/diagnostics'

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const uiTheme = cookieStore.get('ui-theme')?.value ?? 'light'
  const diagnosticsEnabled = isDiagnosticsEnabled()
  const diagnosticsScript = `
    window.__diag = window.__diag || { hydrationWarnings: [] }
    ;(function () {
      const EVENT_NAME = ${JSON.stringify(DIAGNOSTICS_EVENT_NAME)}
      const diag = window.__diag
      if (!Array.isArray(diag.hydrationWarnings)) {
        diag.hydrationWarnings = []
      }
      if (diag._hydrationHookInstalled) return
      diag._hydrationHookInstalled = true
      const emit = () => {
        try {
          window.dispatchEvent(new CustomEvent(EVENT_NAME))
        } catch (error) {
          // noop
        }
      }
      const toLine = (value) => {
        if (typeof value === 'string') {
          return value.replace(/\s+/g, ' ').trim()
        }
        try {
          return JSON.stringify(value)
        } catch (err) {
          return String(value)
        }
      }
      const shouldCapture = (value) =>
        typeof value === 'string' &&
        (/hydration/i.test(value) || /did not match/i.test(value) || /Expected server HTML/i.test(value))
      const originalError = console.error
      console.error = function (...args) {
        if (shouldCapture(args[0])) {
          try {
            const line = args.map(toLine).join(' ')
            if (!diag.hydrationWarnings.includes(line)) {
              diag.hydrationWarnings.push(line)
            }
            emit()
          } catch (err) {
            // noop
          }
        }
        return originalError.apply(console, args)
      }
    })()
  `

  return (
    <html lang="ja" data-theme={uiTheme} suppressHydrationWarning>
      <body>
        {diagnosticsEnabled && (
          <>
            <Script id="builder-diagnostics" strategy="beforeInteractive">
              {diagnosticsScript}
            </Script>
            <DiagnosticsConsole />
          </>
        )}
        <ErrorBoundary>
          <Providers initialTheme={uiTheme}>
            <ChromeController />
            <SiteHeader />
            <main className="min-h-[calc(100vh-6rem)]">{children}</main>
            <SiteFooter />
            <RootHotkeys />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  )
}
