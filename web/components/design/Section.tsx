'use client'
import React, { PropsWithChildren } from 'react'

type Props = PropsWithChildren<{ max?: 'sm' | 'md' | 'lg' | 'xl'; pad?: 'sm' | 'md' | 'lg'; align?: 'left' | 'center'; className?: string }>

export default function Section({ max = 'lg', pad = 'md', align = 'left', className, children }: Props) {
  const maxClass = { sm: 'max-w-screen-sm', md: 'max-w-screen-md', lg: 'max-w-screen-lg', xl: 'max-w-screen-xl' }[max]
  const padClass = { sm: 'p-4', md: 'p-8', lg: 'p-12' }[pad]
  const alignClass = align === 'center' ? 'text-center' : ''
  const wrapperAlign = align === 'center' ? 'mx-auto' : ''
  return (
    <section className={[padClass, className].filter(Boolean).join(' ')}>
      <div className={[maxClass, wrapperAlign, alignClass].filter(Boolean).join(' ')}>{children}</div>
    </section>
  )
}
