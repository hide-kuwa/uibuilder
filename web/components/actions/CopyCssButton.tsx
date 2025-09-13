'use client'
import React, { forwardRef } from 'react'
import { selectionToCss, type StyleLike } from '@/lib/style/selectionToCss'
import { copyText } from '@/lib/clipboard/copyText'
import { t } from '@/lib/i18n/i18n'

export default forwardRef<HTMLButtonElement, { styles?: StyleLike[]; onCopied?: (css: string)=>void; ariaLabel?: string }>(function CopyCssButton({ styles, onCopied, ariaLabel }, ref) {
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
    <button ref={ref} className="btn" onClick={onClick} disabled={disabled} aria-label={ariaLabel || t('copyCss')}>
      {t('copyCss')}
    </button>
  )
})
