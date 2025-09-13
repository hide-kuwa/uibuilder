'use client'
import { useThemeStore } from '@/stores/themeStore'

export default function ThemePanel() {
  const themeId = useThemeStore((s) => s.themeId)
  const setTheme = useThemeStore((s) => s.setTheme)
  return (
    <div className="flex gap-2">
      <button
        className={themeId === 'theme-default' ? 'font-bold' : ''}
        onClick={() => setTheme('theme-default')}
      >
        Light
      </button>
      <button
        className={themeId === 'theme-default-dark' ? 'font-bold' : ''}
        onClick={() => setTheme('theme-default-dark')}
      >
        Dark
      </button>
    </div>
  )
}
