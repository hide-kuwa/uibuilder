'use client'
import { THEME_PRESETS } from '@/themes/presets'

export default function ThemeGallery() {
  const apply = (tokens: Record<string, string>) => {
    ;(window as any).__io?.applyImportedThemes?.([{ id: 'active', tokens }], 'overwrite')
  }
  return (
    <div className="grid grid-cols-3 gap-2">
      {THEME_PRESETS.map((p) => (
        <button
          key={p.id}
          className="rounded border p-3 text-left bg-white/5 hover:bg-white/10 transition"
          onClick={() => apply(p.tokens)}
          aria-label={`Apply ${p.name}`}
        >
          <div className="h-8 w-full rounded mb-2" style={{ background: p.tokens['color-bg'] }} />
          <div className="text-sm font-medium">{p.name}</div>
        </button>
      ))}
    </div>
  )
}

