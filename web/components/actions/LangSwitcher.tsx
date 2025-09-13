'use client'
import { getLocale, setLocale, t } from '@/lib/i18n/i18n'
import { useEffect, useState } from 'react'

export default function LangSwitcher() {
  const [loc, set] = useState(getLocale())
  useEffect(() => { set(getLocale()) }, [])
  return (
    <select aria-label={t('language')}
      value={loc}
      onChange={(e) => { const v = e.target.value as 'en'|'ja'; setLocale(v); set(v) }}
      className="h-7 px-2 rounded bg-neutral-900"
      title={t('language')}
    >
      <option value="en">English</option>
      <option value="ja">日本語</option>
    </select>
  )
}

