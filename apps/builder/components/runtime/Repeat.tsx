'use client'
import React from 'react'
import { deepGet } from '@/lib/utils/deepGet'

type Props = {
  data?: any[] | null
  runtime?: any
  dataPath?: string
  itemKey?: string
  children: React.ReactNode
}

export default function Repeat({ data, runtime, dataPath, itemKey, children }: Props) {
  const list = Array.isArray(data) ? data : (dataPath ? (deepGet(runtime, dataPath) as any[]) : [])
  if (list.length === 0) return <div className="text-xs text-gray-500">0 items</div>
  return (
    <div data-testid="repeat-container">
      {list.map((row, i) => (
        <div data-testid="repeat-item" key={(itemKey && row && row[itemKey]) || i}>{children}</div>
      ))}
    </div>
  )
}
