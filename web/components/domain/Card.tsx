'use client'
import React from 'react'
export type CardProps = { title?: string; body?: string }
export default function Card({ title, body }: CardProps) {
  return (
    <div style={{ border: '1px solid #27272a', borderRadius: 8, padding: 12 }}>
      {title ? <div style={{ fontWeight: 600, marginBottom: 6 }}>{title}</div> : null}
      <div style={{ fontSize: 14 }}>{body || 'Card body'}</div>
    </div>
  )
}
