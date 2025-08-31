'use client'
import React from 'react'
export type HeaderProps = { title?: string; subtitle?: string; align?: 'left' | 'center' | 'right' }
export default function Header({ title, subtitle, align = 'left' }: HeaderProps) {
  return (
    <div style={{ textAlign: align }}>
      <div style={{ fontSize: 24, fontWeight: 700 }}>{title || 'Header'}</div>
      {subtitle ? <div style={{ fontSize: 14, opacity: 0.8 }}>{subtitle}</div> : null}
    </div>
  )
}
