'use client'
import * as React from 'react'

export default function Footer({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return <footer {...props}>{children}</footer>
}

