'use client'
import * as React from 'react'

export default function Header({ children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <header {...props}>{children}</header>
  )
}

