'use client'
import * as React from 'react'

export default function Hud({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props}>{children}</div>
}

