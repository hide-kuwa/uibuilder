'use client'
import * as React from 'react'

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  text?: string
}

export default function Text({ text, children, ...props }: TextProps) {
  return <span {...props}>{children ?? text}</span>
}

