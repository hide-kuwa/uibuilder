'use client'
import { useEffect } from 'react'
import { useFigmaStore } from '../lib/figma/store'

export default function ThemeManager() {
  const { themePresets, activeThemeId } = useFigmaStore((s) => ({
    themePresets: s.doc.themePresets ?? [],
    activeThemeId: s.doc.activeThemeId,
  }))

  useEffect(() => {
    if (typeof document === 'undefined') return
    const preset = themePresets.find((p) => p.id === activeThemeId)
    let el = document.getElementById('theme-vars') as HTMLStyleElement | null
    if (!el) {
      el = document.createElement('style')
      el.id = 'theme-vars'
      document.head.appendChild(el)
    }
    if (!preset) {
      el.textContent = ''
      return
    }
    const toVar = (k: string) => `--${k.replace(/\./g, '-')}`
    const lines = Object.entries(preset.tokens).map(([k, v]) => `${toVar(k)}: ${v};`)
    el.textContent = `:root{${lines.join('')}}`
  }, [themePresets, activeThemeId])

  return null
}

