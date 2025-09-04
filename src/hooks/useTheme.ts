import { useContext, useLayoutEffect, useRef } from 'react'
import { ThemeContext, applyTheme } from '../components/theme/ThemeProvider'
import type { ThemeTokens } from '../stores/themeStore'

interface UseThemeOptions {
  pageId?: string
  layoutId?: string
  override?: Partial<ThemeTokens>
  scope?: 'global' | 'local'
}

interface UseThemeResult {
  theme: ThemeTokens
  attrs?: Record<string, string>
}

export function useTheme(options?: UseThemeOptions): UseThemeResult {
  const { getEffectiveTheme } = useContext(ThemeContext)
  const theme = getEffectiveTheme({
    pageId: options?.pageId,
    layoutId: options?.layoutId,
    override: options?.override
  })

  const scopeIdRef = useRef<string>()

  useLayoutEffect(() => {
    const el =
      options?.scope === 'local'
        ? scopeIdRef.current
          ? (document.querySelector(`[data-theme-scope='${scopeIdRef.current}']`) as HTMLElement | null)
          : null
        : document.documentElement
    if (el) {
      applyTheme(theme, el)
    }
  }, [theme, options?.scope])

  if (options?.scope === 'local') {
    if (!scopeIdRef.current) {
      scopeIdRef.current = Math.random().toString(36).slice(2, 8)
    }
    return { theme, attrs: { 'data-theme-scope': scopeIdRef.current } }
  }

  return { theme }
}
