'use client'
import React from 'react'
type Props = { text?: string; size?: 'sm'|'base'|'lg'|'xl'; color?: string; bold?: boolean }
export function Text(p: Props) {
  const s = p.size === 'sm' ? 'text-sm' : p.size === 'lg' ? 'text-lg' : p.size === 'xl' ? 'text-xl' : 'text-base'
  const w = p.bold ? 'font-bold' : 'font-normal'
  return <span className={`${s} ${w}`} style={{ color: p.color }}>{p.text}</span>
}
