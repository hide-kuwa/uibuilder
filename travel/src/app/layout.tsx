import './globals.css'
import type { ReactNode } from 'react'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-secondary text-text-primary min-h-screen pb-16">
        <main className="min-h-full">{children}</main>
      </body>
    </html>
  )
}
