'use client'
import { useEffect } from 'react'
import { selectionToCss, type StyleLike } from '@/lib/style/selectionToCss'
import { copyText } from '@/lib/clipboard/copyText'

export function useCopyCssHotkey(getStyles?: () => StyleLike[] | null | undefined, onCopied?: (css: string) => void) {
  useEffect(() => {
    const handler = async (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      const isCopyCss = mod && e.shiftKey && (e.key.toLowerCase() === 'c')
      if (!isCopyCss) return
      e.preventDefault()
      try {
        let styles: StyleLike[] | null | undefined
        if (getStyles) styles = getStyles()
        else {
          // runtime probing hook that an app can implement
          // @ts-expect-error runtime probing
          const provider = (window as any).__selectionCssProvider as (() => StyleLike[] | null | undefined) | undefined
          styles = provider?.()
        }
        if (!styles || !styles.length) return
        const css = selectionToCss(styles)
        await copyText(css)
        onCopied?.(css)
      } catch {}
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [getStyles, onCopied])
}

