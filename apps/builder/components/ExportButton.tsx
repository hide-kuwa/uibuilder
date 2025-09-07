// apps/builder/components/ExportButton.tsx
'use client'
import React from 'react'

export function ExportButton({ getPage }: { getPage: () => any }) {
  const onExport = async () => {
    const page = getPage()
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ page }),
    })
    if (!res.ok) {
      const msg = await res.text().catch(() => '')
      alert(`Export failed: ${res.status} ${msg}`)
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${page?.id || 'page'}-export.zip`
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <button className="underline" onClick={onExport} type="button">Export zip</button>
  )
}

