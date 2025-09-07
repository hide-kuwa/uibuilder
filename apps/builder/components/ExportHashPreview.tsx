// apps/builder/components/ExportHashPreview.tsx
'use client'
import React from 'react'

function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input)
  return crypto.subtle.digest('SHA-256', enc).then(buf =>
    Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  )
}

export function ExportHashPreview({ page }: { page: any }) {
  const [hash, setHash] = React.useState<string>('')

  React.useEffect(() => {
    const json = JSON.stringify(page ?? {})
    let alive = true
    sha256Hex(json).then(h => alive && setHash(h))
    return () => { alive = false }
  }, [page])

  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>contentHash (preview)</div>
      <code style={{
        display: 'inline-block',
        padding: '6px 8px',
        border: '1px solid #eee',
        borderRadius: 6,
        background: '#fafafa'
      }}>{hash || '…'}</code>
    </div>
  )
}

