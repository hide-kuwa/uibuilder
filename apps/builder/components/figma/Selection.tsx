'use client'
import type { Node } from '../../lib/figma/model'

export default function Selection({ node }: { node: Node }) {
  return (
    <div className="absolute inset-0">
      {/* outline: moved from Canvas to Selection for clear responsibility */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ outline: '1px solid #3b82f6', borderRadius: 2 }}
      />
      {/* existing resize handles ... */}
    </div>
  )
}

