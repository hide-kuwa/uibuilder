// apps/builder/components/bindings/ApplyLastSnippetButton.tsx
'use client'
import * as React from 'react'
import { useBindingsInsert } from './useBindingsInsert'

export function ApplyLastSnippetButton(props: { onApply: (formula: string) => void }) {
  const last = useBindingsInsert()
  const disabled = !last?.formula

  return (
    <button
      type="button"
      onClick={() => last?.formula && props.onApply(last.formula)}
      disabled={disabled}
      aria-disabled={disabled}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          if (!disabled && last?.formula) props.onApply(last.formula)
        }
      }}
      style={{
        marginLeft: 8,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      title={disabled ? 'Snippets から挿入すると有効になります' : `最後に選んだ: ${last?.key ?? ''}`}
    >
      最後の挿入を適用
    </button>
  )
}
