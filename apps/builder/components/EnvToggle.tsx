'use client'
import React from 'react'
import { useEnvStore } from '@/stores/env'

export default function EnvToggle(props: React.HTMLAttributes<HTMLDivElement>) {
  const mode = useEnvStore((s) => s.mode)
  const setMode = useEnvStore((s) => s.setMode)
  return (
    <div data-testid="env-toggle" data-env={mode} aria-pressed={mode === 'live'} className="text-xs inline-flex items-center gap-2" {...props}>
      <span>Env:</span>
      <select value={mode} onChange={(e) => setMode(e.target.value as any)} className="border rounded px-2 py-0.5">
        <option value="mock">Mock</option>
        <option value="live">Live</option>
      </select>
    </div>
  )
}
