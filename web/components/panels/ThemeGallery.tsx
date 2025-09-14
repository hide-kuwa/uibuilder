'use client'
import { THEME_PRESETS } from '@/themes/presets'
import { t } from '@/lib/i18n/i18n'

export default function ThemeGallery() {
  const apply = (tokens: Record<string, string>) => {
    ;(window as any).__io?.applyImportedThemes?.([{ id: 'active', tokens }], 'overwrite')
  }
  return (
    <div className="grid grid-cols-3 gap-3" aria-label={t('themePresets')}>
      {THEME_PRESETS.map((p) => {
        const bg = p.tokens['color-bg']; const fg = p.tokens['color-fg']; const ac = p.tokens['color-accent']
        const radius = p.tokens['radius'] ?? '8px'
        return (
          <div key={p.id} className="rounded-2xl border p-3 shadow-sm bg-white/5">
            <div className="h-10 w-full rounded-md mb-2" style={{ background: bg }} />
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">{p.name}</div>
              <span className="inline-block h-3 w-6 rounded" style={{ background: ac }} aria-label="accent preview" />
            </div>
            <div className="text-xs opacity-80 mb-2" style={{ color: fg }}>
              {t('preview')}
            </div>
            <button
              className="w-full rounded-md px-2 py-1 text-sm"
              style={{ background: ac, color: bg, borderRadius: radius as any }}
              onClick={() => apply(p.tokens)}
              aria-label={`${t('apply')} ${p.name}`}
            >
              {t('apply')}
            </button>
          </div>
        )
      })}
    </div>
  )
}
