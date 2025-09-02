'use client'
import React from 'react'

type CardProps = {
  title?: string
  toolbar?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export default function Card({ title, toolbar, className, children }: CardProps) {
  return (
    <div
      className={[
        'rounded-2xl shadow-sm border bg-background',
        'flex flex-col min-w-[240px] min-h-[160px]',
        className ?? '',
      ].join(' ')}
    >
      {(title || toolbar) && (
        <div className="px-3 py-2 border-b flex items-center justify-between">
          <div className="text-sm font-medium truncate">{title}</div>
          <div className="flex items-center gap-2">{toolbar}</div>
        </div>
      )}
      <div className="p-3 flex-1 overflow-auto">{children}</div>
    </div>
  )
}
