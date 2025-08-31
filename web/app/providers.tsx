'use client'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

type Props = { children: React.ReactNode; initialTheme?: string }

export default function Providers({ children, initialTheme }: Props) {
  const [client] = React.useState(() => new QueryClient())
  return (
    <QueryClientProvider client={client}>
      {children}
      {process.env.NODE_ENV !== 'production' ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  )
}
