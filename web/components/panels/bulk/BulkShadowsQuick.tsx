'use client'
import { t } from '@/lib/i18n/i18n'
type Num = number | string | { token: string; fallback?: string }
type Shadow = { x: Num; y: Num; blur?: Num; spread?: Num; color?: string; inset?: boolean }

const PRESETS: Record<string, Shadow[]> = {
  none: [],
  soft: [{ x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,.12)' }],
  medium: [{ x: 0, y: 2, blur: 8, spread: 0, color: 'rgba(0,0,0,.18)' }],
  strong: [{ x: 0, y: 4, blur: 16, spread: 0, color: 'rgba(0,0,0,.24)' }],
  inset: [{ inset: true, x: 0, y: 1, blur: 2, spread: 0, color: 'rgba(0,0,0,.15)' }],
}

export default function BulkShadowsQuick() {
  const styles: Array<{ shadows?: Shadow[] }> = (window as any).__selectionCssProvider?.() ?? []
  const allSame = (() => {
    if (!styles.length) return true
    const base = JSON.stringify(styles[0].shadows ?? null)
    return styles.every((s) => JSON.stringify(s.shadows ?? null) === base)
  })()

  const applyPreset = (k: keyof typeof PRESETS) => {
    ;(window as any).__mut?.applyStyle({ shadows: PRESETS[k] })
  }

  const copyFromFirst = () => {
    const src = styles[0]?.shadows ?? []
    ;(window as any).__mut?.applyStyle({ shadows: src })
  }

  const openDetailed = () => {
    ;(window as any).__ui?.openShadows?.()
  }

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('shadowsQuick')}>
      <span className="min-w-28 text-sm">{t('shadowsQuick')}</span>
      <button className="btn btn-xs" onClick={() => applyPreset('none')} aria-label={t('none')}>{t('none')}</button>
      <button className="btn btn-xs" onClick={() => applyPreset('soft')} aria-label={t('soft')}>{t('soft')}</button>
      <button className="btn btn-xs" onClick={() => applyPreset('medium')} aria-label={t('medium')}>{t('medium')}</button>
      <button className="btn btn-xs" onClick={() => applyPreset('strong')} aria-label={t('strong')}>{t('strong')}</button>
      <button className="btn btn-xs" onClick={() => applyPreset('inset')} aria-label={t('inset')}>{t('inset')}</button>
      <div className="mx-2 h-4 w-px bg-white/20" />
      <button className="btn btn-xs" onClick={copyFromFirst} aria-label={t('copyFromFirst')}>{t('copyFromFirst')}</button>
      <button className="btn btn-xs" onClick={openDetailed} aria-label={t('openDetailedEditor')}>{t('openDetailedEditor')}</button>
      <span className="text-xs opacity-70 ml-auto">{allSame ? '' : t('mixed')}</span>
    </div>
  )
}
