'use client'
import React from 'react'
import { selectionToCss, type StyleLike } from '@/lib/style/selectionToCss'
import { copyText } from '@/lib/clipboard/copyText'

export default function CopyCssButton({ styles, onCopied }: { styles?: StyleLike[]; onCopied?: (css: string)=>void }) {
  const onClick = async () => {
    let nodes = styles
    if (!nodes) {
      try {
        // @ts-expect-error runtime probing for app-provided selection adapter
        const provider = (window as any).__selectionCssProvider as (() => StyleLike[] | null | undefined) | undefined
        nodes = provider?.() || undefined
      } catch {}
    }
    if (!nodes || !nodes.length) return
    const css = selectionToCss(nodes)
    await copyText(css)
    try { onCopied?.(css) } catch {}
    // TODO: toast telemetry hook can hook here
  }
  const disabled = !(styles?.length ?? true)
  return (
    <button className="btn" onClick={onClick} disabled={disabled}>Copy CSS</button>
  )
}

