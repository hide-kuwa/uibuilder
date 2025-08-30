'use client'
import * as React from 'react'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  text?: string
  variant?: 'solid' | 'ghost'
  color?: string
  href?: string
}

export default function Button({
  text = 'Button',
  variant = 'solid',
  color = '#2563eb',
  href,
  children,
  style,
  ...props
}: ButtonProps) {
  const styles =
    variant === 'ghost'
      ? { background: 'transparent', border: `1px solid ${color}`, color }
      : { background: color, color: '#fff', border: 'none' }
  const Tag: any = href ? 'a' : 'button'
  return (
    <Tag
      {...props}
      href={href}
      style={{ ...(style || {}), ...styles }}
    >
      {children ?? text}
    </Tag>
  )
}
