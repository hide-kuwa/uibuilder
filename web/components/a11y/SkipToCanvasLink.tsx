'use client'
import { t } from '@/lib/i18n/i18n'

export default function SkipToCanvasLink() {
  return (
    <a href="#canvas-root"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:bg-black/80 focus:text-white focus:px-3 focus:py-2 focus:rounded"
    >
      {t('skipToCanvas')}
    </a>
  )
}

