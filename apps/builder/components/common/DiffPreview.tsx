'use client'
import React from 'react'

export default function DiffPreview({ before, after }: { before?: string; after?: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <div className="text-sm opacity-70 mb-1">Before</div>
        <pre className="p-2 rounded bg-gray-50 overflow-auto text-xs whitespace-pre-wrap">{before}</pre>
      </div>
      <div>
        <div className="text-sm opacity-70 mb-1">After</div>
        <pre className="p-2 rounded bg-gray-50 overflow-auto text-xs whitespace-pre-wrap">{after}</pre>
      </div>
    </div>
  )
}

