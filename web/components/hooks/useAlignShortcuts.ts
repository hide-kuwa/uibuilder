'use client'
import { useEffect } from 'react'
import { alignSelected, distributeSelected } from '@/lib/alignActions'

export function useAlignShortcuts() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.ctrlKey || e.metaKey
      if (!meta) return
      if (e.key === 'ArrowLeft') { e.preventDefault(); alignSelected('left','first') }
      if (e.key === 'ArrowRight') { e.preventDefault(); alignSelected('right','first') }
      if (e.key === 'ArrowUp') { e.preventDefault(); alignSelected('top','first') }
      if (e.key === 'ArrowDown') { e.preventDefault(); alignSelected('bottom','first') }
      if (e.key.toLowerCase() === 'e' && e.shiftKey) { e.preventDefault(); alignSelected('hcenter','selection') }
      if (e.key.toLowerCase() === 'd' && e.shiftKey) { e.preventDefault(); alignSelected('vcenter','selection') }
      if (e.key.toLowerCase() === 'h' && e.shiftKey) { e.preventDefault(); distributeSelected('hgap','selection') }
      if (e.key.toLowerCase() === 'v' && e.shiftKey) { e.preventDefault(); distributeSelected('vgap','selection') }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

