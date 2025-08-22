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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const system: Theme = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

  useEffect(() => {
    const stored = (typeof window !== 'undefined' && localStorage.getItem('ui:theme')) as ThemeMode | null
    const initial = stored === 'system' || !stored ? system : (stored as Theme)
    setThemeState(initial)
    document.documentElement.setAttribute('data-theme', initial)
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => {
      if (localStorage.getItem('ui:theme') === 'system' || !localStorage.getItem('ui:theme')) {
        const next = mq.matches ? 'dark' : 'light'
        document.documentElement.setAttribute('data-theme', next)
        setThemeState(next)
      }
    }
    mq.addEventListener('change', listener)
    return () => mq.removeEventListener('change', listener)
  }, [system])

  const setTheme = (t: ThemeMode) => {
    localStorage.setItem('ui:theme', t)
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

export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html:
          "try{const t=localStorage.getItem('ui:theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',t)}catch(e){}"
      }}
    />
  )
}
