'use client'
import { useThemeContext, ThemeMode } from './ThemeProvider'

export function useTheme() {
  return useThemeContext()
}

export type { ThemeMode }
