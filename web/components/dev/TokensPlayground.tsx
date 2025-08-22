'use client'
import { tokens } from '../../lib/tokens'

export function TokensPlayground() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(tokens.color.bg).map(([name]) => (
        <div key={name} className="p-4 rounded-md border" style={{ background: `hsl(var(--color-bg-${name}))` }}>
          <span className="text-xs">bg.{name}</span>
        </div>
      ))}
    </div>
  )
}
