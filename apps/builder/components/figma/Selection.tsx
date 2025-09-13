'use client'
import type { Node } from '../../lib/figma/model'
import { useFigmaStore } from '../../lib/figma/store'

export default function Selection({ node }: { node: Node }) {
  const isMulti = useFigmaStore((s) => s.selectedIds.length > 1)
  const isAltDrag = useFigmaStore((s) => s.transformAlt === true)
  const color = isAltDrag
    ? 'var(--color-accent-dup, #10b981)'
    : 'var(--color-accent, #3b82f6)'
  const styleOutline = `${isMulti ? '1px dashed' : '1px solid'} ${color}`

  return (
    <div className="absolute inset-0">
      {/* アウトライン（Canvasから責務移管） */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ outline: styleOutline, borderRadius: 2 }}
      />
      {/* 既存のリサイズハンドル等 */}
    </div>
  )
}
