'use client'
import React from 'react'

type Props = {
  label?: string
  href?: string
  variant?: 'primary'|'secondary'|'ghost'
  disabled?: boolean
}
export function Button(p: Props) {
  const cls = p.variant === 'secondary' ? 'bg-gray-200' : p.variant === 'ghost' ? 'bg-transparent border' : 'bg-blue-600 text-white'
  if (p.href) return <a className={`inline-flex px-3 h-9 items-center rounded ${cls} ${p.disabled?'opacity-50 pointer-events-none':''}`} href={p.href}>{p.label}</a>
  return <button className={`inline-flex px-3 h-9 items-center rounded ${cls}`} disabled={p.disabled}>{p.label}</button>
}
