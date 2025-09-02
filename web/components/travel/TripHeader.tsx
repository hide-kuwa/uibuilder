'use client'
import React from 'react'

export type TripHeaderProps = {
  title?: string
  period?: string // 例: 2025/09/01–09/05
  members?: string // 例: 4名
  coverUrl?: string
}

export default function TripHeader({ title='未命名の旅', period, members, coverUrl }: TripHeaderProps) {
  return (
    <div className="flex gap-3 items-center">
      {coverUrl && <img src={coverUrl} alt="" className="w-20 h-20 object-cover rounded-xl border" />}
      <div className="min-w-0">
        <div className="text-lg font-semibold truncate">{title}</div>
        <div className="text-xs text-muted-foreground">{[period, members].filter(Boolean).join(' ｜ ')}</div>
      </div>
    </div>
  )
}

