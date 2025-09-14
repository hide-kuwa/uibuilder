'use client'
import BulkField from './bulk/BulkField'
import BulkShadowsQuick from './bulk/BulkShadowsQuick'
import { pickMixed } from '@/lib/style/detectMixed'
import { t } from '@/lib/i18n/i18n'

type TokenRef = { token: string; fallback?: string }
type Num = number | string | TokenRef
type StyleLike = {
  id?: string
  fill?: Num
  stroke?: Num
  strokeWidth?: Num
  opacity?: Num
  radius?: Num // まずは単値、四隅は後続
  shadows?: any[] // ShadowsPanelに委譲
}

export default function BulkStylePanel() {
  const styles: StyleLike[] = (window as any).__selectionCssProvider?.() ?? []

  const mFill = pickMixed(styles.map((s) => s.fill))
  const mStroke = pickMixed(styles.map((s) => s.stroke))
  const mStrokeWidth = pickMixed(styles.map((s) => s.strokeWidth))
  const mRadius = pickMixed(styles.map((s) => s.radius))
  const mOpacity = pickMixed(styles.map((s) => s.opacity))

  const patch: Partial<StyleLike> = {}
  const set = (k: keyof StyleLike) => (v: any) => {
    if (v == null) delete (patch as any)[k]
    else (patch as any)[k] = v
  }

  const applyAll = () => {
    if (Object.keys(patch).length === 0) return
    ;(window as any).__mut?.applyStyle?.(patch)
  }

  return (
    <div className="space-y-2" role="region" aria-label={t('bulkEdit')}>
      <BulkField label={t('fill')} mixed={mFill} onChange={set('fill')} mode="string" />
      <BulkField label={t('stroke')} mixed={mStroke} onChange={set('stroke')} mode="string" />
      <BulkField label={t('strokeWidth')} mixed={mStrokeWidth} onChange={set('strokeWidth')} mode="px" />
      <BulkField label={t('radius')} mixed={mRadius} onChange={set('radius')} mode="px" />
      <BulkField label={t('opacity')} mixed={mOpacity} onChange={set('opacity')} mode="px" />
      <BulkShadowsQuick />
      <div className="flex justify-end">
        <button className="btn" onClick={applyAll} aria-label={t('applyToSelection')}>
          {t('applyToSelection')}
        </button>
      </div>
    </div>
  )
}
