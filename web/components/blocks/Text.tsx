'use client'
import * as React from 'react'

interface TextProps extends React.HTMLAttributes<HTMLElement> {
  text?: string
  color?: string
  size?: number
}

export default function Text({ text, children, color, size = 14, style, ...props }: TextProps) {
  return (
    <span {...props} style={{ ...(style || {}), color, fontSize: size }}>
      {children ?? text}
    </span>
  )
}
