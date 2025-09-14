'use client'
import { useState } from 'react'
import type { Mixed } from '@/lib/style/detectMixed'
import { t } from '@/lib/i18n/i18n'

type TokenRef = { token: string; fallback?: string }
type Num = number | string | TokenRef
type Props = {
  label: string
  mixed: Mixed<Num>
  onChange: (v: Num | null) => void // nullなら未適用扱い
  mode?: 'px' | 'token' | 'string'
}
export default function BulkField({ label, mixed, onChange, mode: initMode = 'px' }: Props) {
  const [enabled, setEnabled] = useState(false)
  const [mode, setMode] = useState(initMode)
  const [px, setPx] = useState<number>(mixed.kind === 'value' && typeof mixed.value === 'number' ? mixed.value : 0)
  const [str, setStr] = useState<string>(mixed.kind === 'value' && typeof mixed.value === 'string' ? mixed.value : '')
  const [tok, setTok] = useState<string>('')
  const [fb, setFb] = useState<string>('')

  const apply = () => {
    if (!enabled) return onChange(null)
    if (mode === 'px') return onChange(px)
    if (mode === 'string') return onChange(str)
    return onChange({ token: tok, fallback: fb })
  }

  return (
    <div className="flex items-center gap-2" role="group" aria-label={label}>
      <label className="min-w-28 text-sm">{label}</label>
      <input type="checkbox" aria-label={`${label} enable`} checked={enabled} onChange={(e) => { setEnabled(e.target.checked) }} />
      {mode === 'px' && (
        <input type="number" className="w-20" value={px} onChange={(e) => setPx(Number(e.target.value))} aria-label={`${label} px`} />
      )}
      {mode === 'string' && (
        <input className="w-36" value={str} onChange={(e) => setStr(e.target.value)} aria-label={`${label} string`} />
      )}
      {mode === 'token' && (
        <div className="flex gap-1">
          <input className="w-28" placeholder="token" value={tok} onChange={(e) => setTok(e.target.value)} aria-label={`${label} token`} />
          <input className="w-24" placeholder="fallback" value={fb} onChange={(e) => setFb(e.target.value)} aria-label={`${label} fallback`} />
        </div>
      )}
      <select aria-label={`${label} mode`} value={mode} onChange={(e) => setMode(e.target.value as any)}>
        <option value="px">px</option>
        <option value="token">token</option>
        <option value="string">string</option>
      </select>
      <span className="text-xs opacity-70">{mixed.kind === 'mixed' ? t('mixed') : mixed.kind === 'empty' ? '—' : ''}</span>
      <button className="btn btn-xs ml-auto" onClick={apply} aria-label={`${label} apply`}>✓</button>
    </div>
  )
}

