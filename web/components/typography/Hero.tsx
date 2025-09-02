'use client'
import React from 'react'

type Props = { title: string; subtitle?: string; ctaText?: string; ctaHref?: string }

export default function Hero({ title, subtitle, ctaText, ctaHref }: Props) {
  return (
    <div className="text-center py-12 space-y-4">
      <h1 className="text-4xl font-bold">{title}</h1>
      {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      {ctaText && ctaHref && (
        <a href={ctaHref} className="inline-block px-4 py-2 rounded bg-primary text-primary-foreground">
          {ctaText}
        </a>
      )}
    </div>
  )
}
