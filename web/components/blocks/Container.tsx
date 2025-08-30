'use client'
import * as React from 'react'

export default function Container({ children, style, bg, radius = 8, border = true, ...props }: any) {
  return (
    <div
      {...props}
      style={{
        ...(style || {}),
        background: bg,
        borderRadius: radius,
        border: border ? '1px solid #374151' : 'none',
      }}
    >
      {children}
    </div>
  )
}
