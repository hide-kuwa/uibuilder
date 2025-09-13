'use client'
import { useEffect, useState } from 'react'

export function useHotkeysHelp() {
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey
      const isQ = e.key === '?' || (e.shiftKey && (e.key === '/' || e.code === 'Slash'))
      if (mod && isQ) { e.preventDefault(); setOpen((v) => !v) }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  return { open, setOpen }
}

