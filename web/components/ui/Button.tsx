'use client'
import { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/ui/cn'
import { variants } from '../../lib/ui/variants'

const buttonVar = variants({
  variant: {
    solid: '',
    outline: 'border border-border bg-transparent',
    ghost: 'bg-transparent'
  },
  tone: {
    neutral: 'bg-bg-panel text-fg',
    primary: 'bg-accent-default text-accent-fg',
    success: 'bg-state-success text-fg-inverted',
    warn: 'bg-state-warn text-fg-inverted',
    danger: 'bg-state-danger text-fg-inverted'
  },
  size: {
    sm: 'text-sm px-3 py-1 rounded-sm',
    md: 'text-base px-4 py-2 rounded-md',
    lg: 'text-lg px-6 py-3 rounded-lg'
  }
})

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'solid' | 'outline' | 'ghost'
  tone?: 'neutral' | 'primary' | 'success' | 'warn' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({ variant = 'solid', tone = 'neutral', size = 'md', className, children, ...props }: ButtonProps) {
  const classes = cn(
    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none',
    buttonVar({ variant, tone, size }),
    className
  )
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}
