'use client'
import React, { PropsWithChildren } from 'react'

type Pattern = 'grid' | 'dots' | 'none'

type Props = PropsWithChildren<{ from: string; to: string; angle: number; pattern?: Pattern; className?: string }>

export default function BackgroundGradient({ from, to, angle, pattern = 'none', className, children }: Props) {
  const base = `linear-gradient(${angle}deg, ${from}, ${to})`
  let style: React.CSSProperties = { backgroundImage: base }
  if (pattern === 'grid') {
    style = {
      backgroundImage: `${base},linear-gradient(#ffffff22 1px,transparent 1px),linear-gradient(90deg,#ffffff22 1px,transparent 1px)` ,
      backgroundSize: '100% 100%,20px 20px,20px 20px',
    }
  } else if (pattern === 'dots') {
    style = {
      backgroundImage: `${base},radial-gradient(#ffffff22 1px,transparent 1px)` ,
      backgroundSize: '100% 100%,10px 10px',
    }
  }
  return (
    <div className={["w-full h-full", className].filter(Boolean).join(' ')} style={style}>
      {children}
    </div>
  )
}
