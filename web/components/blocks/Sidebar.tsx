'use client'
import * as React from 'react'

export default function Sidebar({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <aside {...props}>{children}</aside>
}

