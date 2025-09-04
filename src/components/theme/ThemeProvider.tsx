import React, { createContext, useCallback, useLayoutEffect } from 'react'
import { useThemeStore, defaultTheme, type ThemeTokens } from '../../stores/themeStore'
import { useUserStore } from '../../stores/userStore'

interface ThemeContextValue {
  getEffectiveTheme: (opts?: {
    pageId?: string
    layoutId?: string
    override?: Partial<ThemeTokens>
  }) => ThemeTokens
}

export const ThemeContext = createContext<ThemeContextValue>({
  getEffectiveTheme: () => defaultTheme
})

function mergeTheme(base: ThemeTokens, override?: Partial<ThemeTokens>): ThemeTokens {
  if (!override) return base
  return {
    ...base,
    ...override,
    colors: { ...base.colors, ...override.colors },
    radius: { ...base.radius, ...override.radius },
    spacing: { ...base.spacing, ...override.spacing },
    typography: { ...base.typography, ...override.typography }
  }
}

function toCSSVars(theme: ThemeTokens): Record<string, string> {
  const vars: Record<string, string> = {}
  Object.entries(theme.colors).forEach(([k, v]) => {
    vars[`--color-${k}`] = v
  })
  Object.entries(theme.radius).forEach(([k, v]) => {
    vars[`--radius-${k}`] = v
  })
  Object.entries(theme.spacing).forEach(([k, v]) => {
    vars[`--space-${k}`] = v
  })
  vars['--font-family'] = theme.typography.fontFamily
  vars['--font-size-base'] = theme.typography.baseSize
  vars['--heading-scale'] = String(theme.typography.headingScale)
  vars['--font-weight-regular'] = theme.typography.weightRegular
  vars['--font-weight-bold'] = theme.typography.weightBold
  return vars
}

export function applyTheme(theme: ThemeTokens, el: HTMLElement) {
  const vars = toCSSVars(theme)
  for (const [key, value] of Object.entries(vars)) {
    el.style.setProperty(key, value)
  }
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    currentDomainId,
    currentLayoutId,
    currentPageId,
    domainDefaultTheme,
    themes,
    layoutThemeMap,
    pageThemeOverride
  } = useThemeStore()
  const { brandThemeId } = useUserStore()

  const getEffectiveTheme = useCallback(
    ({
      pageId,
      layoutId,
      override
    }: {
      pageId?: string
      layoutId?: string
      override?: Partial<ThemeTokens>
    } = {}): ThemeTokens => {
      const isPreview =
        typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('preview')
      let theme: ThemeTokens
      if (isPreview && brandThemeId && themes[brandThemeId]) {
        theme = themes[brandThemeId]
      } else {
        const domainThemeId = currentDomainId && domainDefaultTheme[currentDomainId]
        theme = domainThemeId && themes[domainThemeId] ? themes[domainThemeId] : defaultTheme

        const layoutThemeId = (layoutId && layoutThemeMap[layoutId]) ||
          (currentLayoutId && layoutThemeMap[currentLayoutId])
        if (layoutThemeId && themes[layoutThemeId]) {
          theme = themes[layoutThemeId]
        }
      }

      const pageOverrideObj =
        (pageId && pageThemeOverride[pageId]) || (currentPageId && pageThemeOverride[currentPageId])
      theme = mergeTheme(theme, pageOverrideObj)
      theme = mergeTheme(theme, override)
      return theme
    },
    [
      brandThemeId,
      currentDomainId,
      currentLayoutId,
      currentPageId,
      domainDefaultTheme,
      themes,
      layoutThemeMap,
      pageThemeOverride
    ]
  )

  useLayoutEffect(() => {
    const theme = getEffectiveTheme()
    applyTheme(theme, document.documentElement)
  }, [getEffectiveTheme])

  return <ThemeContext.Provider value={{ getEffectiveTheme }}>{children}</ThemeContext.Provider>
}
