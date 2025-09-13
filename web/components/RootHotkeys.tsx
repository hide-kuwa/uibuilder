'use client'
import React from 'react'
import { useHotkeysHelp } from '@/hooks/useHotkeysHelp'
import KeyboardHelpModal from '@/components/modals/KeyboardHelpModal'
import { useCopyCssHotkey } from '@/hooks/useCopyCssHotkey'
import type { StyleLike } from '@/lib/style/selectionToCss'

export default function RootHotkeys() {
  const { open, setOpen } = useHotkeysHelp()
  // Install Copy CSS hotkey globally, using a runtime-provided selection adapter if available
  useCopyCssHotkey(() => {
    try {
      // @ts-expect-error runtime probing
      const provider = (window as any).__selectionCssProvider as undefined | (() => StyleLike[] | null | undefined)
      return provider?.() || null
    } catch { return null }
  })
  return (
    <KeyboardHelpModal open={open} onClose={() => setOpen(false)} />
  )
}
