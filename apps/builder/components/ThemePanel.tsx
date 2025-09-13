'use client'
import { useMemo, useRef } from 'react'
import { useFigmaStore } from '../lib/figma/store'
import ColorInput from './ui/ColorInput'
import { isColorLike, isPxLike } from '../lib/figma/tokenValidators'

export default function ThemePanel() {
  const { presets, activeId, setActive, upsert, remove } = useFigmaStore((s) => ({
    presets: s.doc.themePresets ?? [],
    activeId: s.doc.activeThemeId,
    setActive: s.setActiveTheme,
    upsert: s.upsertThemePreset,
    remove: s.removeThemePreset,
  })) as any

  const active = useMemo(() => presets.find((p: any) => p.id === activeId), [presets, activeId])
  const fileRef = useRef<HTMLInputElement>(null)

  const onNew = () => {
    const id = 'theme_' + Math.random().toString(36).slice(2)
    upsert({ id, name: 'New Theme', tokens: {} })
    setActive(id)
  }
  const onDup = () => {
    if (!active) return
    const id = active.id + '_copy'
    upsert({ id, name: active.name + ' Copy', tokens: { ...active.tokens } })
    setActive(id)
  }
  const onDel = () => {
    if (!active) return
    remove(active.id)
  }
  const onExport = () => {
    if (!active) return
    const data = JSON.stringify(active, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${active.name || active.id}.json`; a.click()
    URL.revokeObjectURL(url)
  }
  const onImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    const fr = new FileReader()
    fr.onload = () => {
      try {
        const parsed = JSON.parse(String(fr.result || '{}'))
        if (parsed && parsed.id && parsed.tokens) {
          upsert(parsed)
          setActive(parsed.id)
        }
      } catch {}
    }
    fr.readAsText(f)
    e.currentTarget.value = ''
  }

  const updateToken = (k: string, v: string) => {
    if (!active) return
    upsert({ ...active, tokens: { ...active.tokens, [k]: v } })
  }
  const addToken = () => {
    if (!active) return
    const k = prompt('Token key (e.g. color.base)')?.trim()
    if (!k) return
    const v = prompt('Token value (e.g. #fff, rgba(...), 8px, var(--...))') ?? ''
    upsert({ ...active, tokens: { ...active.tokens, [k]: v } })
  }
  const removeToken = (k: string) => {
    if (!active) return
    const next = { ...active.tokens }; delete next[k]
    upsert({ ...active, tokens: next })
  }

  const entries = Object.entries(active?.tokens ?? {})
  const groupKey = (k: string) => (k.includes('.') ? k.split('.')[0] : 'others')
  const order = ['color','radius','stroke','shadow','font','opacity','blend','others']
  const groups = new Map<string, [string,string][]>()
  for (const [k,v] of entries) {
    const g = groupKey(k)
    if (!groups.has(g)) groups.set(g, [])
    groups.get(g)!.push([k,String(v)])
  }

  const renderTokenRow = (k: string, v: string) => {
    const warn = !(isColorLike(v) || isPxLike(v)) && (k.startsWith('color.') || k.startsWith('radius.') || k.startsWith('stroke.width'))
    return (
      <div key={k} className="flex items-center gap-2">
        <span className="w-48 text-xs text-gray-500 truncate" title={k}>{k}</span>
        {k.startsWith('color.') ? (
          <ColorInput value={v} onChange={(nv)=>updateToken(k, nv)} aria-label={k} />
        ) : (
          <input className="flex-1 rounded border px-2 py-1 text-xs font-mono" value={v}
            onChange={(e)=>updateToken(k, e.target.value)} />
        )}
        {k.startsWith('shadow.') && (
          <div className="h-10 w-20 rounded border" style={{ boxShadow: v, background: '#fff' }} title={v} />
        )}
        {warn && <span className="text-xs text-amber-600" title="Unrecognized format">⚠︎</span>}
        <button className="rounded bg-gray-100 px-2 py-1 text-xs" onClick={()=>removeToken(k)}>x</button>
      </div>
    )
  }

  const pinnedColors: [string,string,string][] = [
    ['color.base','Base color','背景/余白のベース色'],
    ['color.main','Main color','主役の色'],
    ['color.accent','Accent color','強調に使う色(5%目安)'],
  ]

  return (
    <div className="space-y-2">
      <div className="text-xs uppercase tracking-wider text-gray-400">Theme</div>
      <div className="flex items-center gap-2">
        <select className="rounded border px-2 py-1 text-sm" value={activeId || ''}
          onChange={(e)=>setActive(e.target.value)}>
          <option value="">(none)</option>
          {presets.map((p: any) => <option key={p.id} value={p.id}>{p.name || p.id}</option>)}
        </select>
        <button className="rounded bg-gray-900 text-white px-2 py-1 text-xs" onClick={onNew}>New</button>
        <button className="rounded bg-gray-100 px-2 py-1 text-xs" onClick={onDup} disabled={!active}>Duplicate</button>
        <button className="rounded bg-red-50 text-red-600 px-2 py-1 text-xs" onClick={onDel} disabled={!active}>Delete</button>
        <button className="rounded bg-gray-100 px-2 py-1 text-xs" onClick={onExport} disabled={!active}>Export</button>
        <button className="rounded bg-gray-100 px-2 py-1 text-xs" onClick={()=>fileRef.current?.click()}>Import</button>
        <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImport} />
      </div>
      {active && (
        <div className="space-y-3">
          {/* Pinned colors */}
          <div className="space-y-1">
            <div className="text-xs uppercase tracking-wider text-gray-400">Colors</div>
            {pinnedColors.map(([key,label,help]) => (
              <div key={key} className="flex items-center gap-3">
                <span className="w-32 text-sm">{label}</span>
                <ColorInput value={String(active.tokens[key] ?? '')} onChange={(nv)=>updateToken(key, nv)} aria-label={key} />
                <span className="text-xs text-gray-400">{help}</span>
              </div>
            ))}
          </div>

          {/* Grouped tokens */}
          {order.map((g) => (
            <div key={g} className="space-y-1">
              {groups.has(g) && (
                <>
                  <div className="text-xs uppercase tracking-wider text-gray-400">{g}</div>
                  {groups.get(g)!.map(([k,v]) => (
                    pinnedColors.some(([pk]) => pk === k) ? null : renderTokenRow(k,v)
                  ))}
                </>
              )}
            </div>
          ))}

          <button className="rounded bg-gray-100 px-2 py-1 text-xs" onClick={addToken}>+ Add Token</button>
        </div>
      )}
    </div>
  )
}
