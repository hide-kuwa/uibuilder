'use client'
import { useEffect, useRef } from 'react'
import type { StyleLike } from '@/lib/style/selectionToCss'

// Replace this hook to match your app's selection source.
// Example 1: useSelection((s) => s.computedStyles as StyleLike[])
// Example 2: project selectedIds -> nodes -> map to StyleLike[]
const useComputedStyles = () => [] as StyleLike[]

export default function SelectionCssBridge() {
  const styles = useComputedStyles()
  const ref = useRef<StyleLike[] | null>(null)

  useEffect(() => {
    ref.current = styles
    try {
      // Safely expose provider (re-sets on changes)
      // @ts-expect-error runtime
      window.__selectionCssProvider = () => ref.current ?? []
    } catch {}
    return () => {
      // no-op: consumer checks existence
    }
  }, [styles])

  return null
}

