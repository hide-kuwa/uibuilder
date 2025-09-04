'use client'

import { createContext, useContext, useMemo, type ReactNode } from 'react'

export type ThemeToken = {
  color: string
  radius: string
  spacing: string
  fontSize: string
}

const defaultTheme: ThemeToken = {
  color: '#000',
  radius: '0.25rem',
  spacing: '0.5rem',
  fontSize: '1rem',
}

const DomainThemeContext = createContext<Partial<ThemeToken>>({})
const LayoutThemeContext = createContext<Partial<ThemeToken>>({})

export const DomainThemeProvider = ({
  value,
  children,
}: {
  value?: Partial<ThemeToken>
  children: ReactNode
}) => {
  const parent = useContext(DomainThemeContext)
  const merged = useMemo(() => ({ ...parent, ...value }), [parent, value])
  return (
    <DomainThemeContext.Provider value={merged}>
      {children}
    </DomainThemeContext.Provider>
  )
}

export const LayoutThemeProvider = ({
  value,
  children,
}: {
  value?: Partial<ThemeToken>
  children: ReactNode
}) => {
  const parent = useContext(LayoutThemeContext)
  const merged = useMemo(() => ({ ...parent, ...value }), [parent, value])
  return (
    <LayoutThemeContext.Provider value={merged}>
      {children}
    </LayoutThemeContext.Provider>
  )
}

export function useTheme(overrides?: Partial<ThemeToken>): ThemeToken {
  const domain = useContext(DomainThemeContext)
  const layout = useContext(LayoutThemeContext)
  return {
    color: overrides?.color ?? layout.color ?? domain.color ?? defaultTheme.color,
    radius: overrides?.radius ?? layout.radius ?? domain.radius ?? defaultTheme.radius,
    spacing: overrides?.spacing ?? layout.spacing ?? domain.spacing ?? defaultTheme.spacing,
    fontSize:
      overrides?.fontSize ?? layout.fontSize ?? domain.fontSize ?? defaultTheme.fontSize,
  }
}

export default useTheme

