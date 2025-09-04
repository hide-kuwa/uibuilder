import { create } from 'zustand'
import minimal from '../themes/presets/minimal.json'

export type ThemeTokens = {
  name: string
  brandId?: string
  colors: {
    background: string
    surface: string
    primary: string
    secondary: string
    text: string
    border: string
  }
  radius: {
    sm: string
    md: string
    lg: string
    full: string
  }
  spacing: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
  }
  typography: {
    fontFamily: string
    baseSize: string
    headingScale: number
    weightRegular: string
    weightBold: string
  }
}

export const defaultTheme: ThemeTokens = minimal as ThemeTokens

interface ThemeStore {
  currentDomainId?: string
  currentLayoutId?: string
  currentPageId?: string
  domainDefaultTheme: Record<string, string>
  themes: Record<string, ThemeTokens>
  layoutThemeMap: Record<string, string>
  pageThemeOverride: Record<string, Partial<ThemeTokens>>
  setThemeByDomain: (domainId: string, themeId: string) => void
  setThemeForLayout: (layoutId: string, themeId: string) => void
  setPageThemeOverride: (pageId: string, override: Partial<ThemeTokens>) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  currentDomainId: undefined,
  currentLayoutId: undefined,
  currentPageId: undefined,
  domainDefaultTheme: {},
  themes: { default: defaultTheme },
  layoutThemeMap: {},
  pageThemeOverride: {},
  setThemeByDomain: (domainId, themeId) =>
    set((state) => ({
      domainDefaultTheme: { ...state.domainDefaultTheme, [domainId]: themeId }
    })),
  setThemeForLayout: (layoutId, themeId) =>
    set((state) => ({
      layoutThemeMap: { ...state.layoutThemeMap, [layoutId]: themeId }
    })),
  setPageThemeOverride: (pageId, override) =>
    set((state) => ({
      pageThemeOverride: {
        ...state.pageThemeOverride,
        [pageId]: { ...state.pageThemeOverride[pageId], ...override }
      }
    }))
}))
