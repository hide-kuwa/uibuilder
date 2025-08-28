'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import type { Theme } from '../tokens'

export type ThemeMode = Theme | 'system'

interface ThemeContextValue {
  theme: Theme
  setTheme: (t: ThemeMode) => void
  system: Theme
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  system: 'light'
})

function getCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  return document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${name}=`))
    ?.split('=')[1]
}

function setCookie(name: string, value: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${value}; path=/; max-age=31536000`
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const system: Theme =
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'

  useEffect(() => {
    const stored = getCookie('ui-theme') as ThemeMode | undefined
    const initial = stored === 'system' || !stored ? system : (stored as Theme)
    setThemeState(initial)
    document.documentElement.setAttribute('data-theme', initial)
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => {
      const current = getCookie('ui-theme')
      if (current === 'system' || !current) {
        const next = mq.matches ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', next)
        setThemeState(next)
      }
    }
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [system])

  const setTheme = (t: ThemeMode) => {
    setCookie('ui-theme', t)
    const applied: Theme = t === 'system' ? system : t
    document.documentElement.setAttribute('data-theme', applied)
    setThemeState(applied)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, system }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useThemeContext() {
  return useContext(ThemeContext)
}
