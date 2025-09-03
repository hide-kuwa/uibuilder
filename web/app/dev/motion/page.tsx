'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { MOTION_PRESETS, buildAnimeParamsFromStrength } from '@/lib/motion-presets'
import type { AnimeParams } from 'animejs'

const animeP = () => import('animejs/lib/anime.es.js').then(m => m.default)

export default function MotionLabPage() {
  const url = new URL(typeof window !== 'undefined' ? window.location.href : 'http://localhost')
  const initKey = (url.searchParams.get('p') || 'fadeIn')
  const initStrength = Number(url.searchParams.get('s') || 50)

  const [key, setKey] = useState<string>(initKey)
  const [strength, setStrength] = useState<number>(initStrength)
  const [duration, setDuration] = useState<number | ''>('') // 上書き用
  const [easing, setEasing] = useState<string>('')

  const previewRef = useRef<HTMLDivElement | null>(null)

  const params: AnimeParams = useMemo(() => {
    const base = buildAnimeParamsFromStrength(key, strength) || {}
    const over: AnimeParams = {}
    if (duration !== '') over.duration = duration
    if (easing) over.easing = easing
    return { ...base, ...over }
  }, [key, strength, duration, easing])

  const play = async () => {
    const el = previewRef.current
    if (!el) return
    const anime = await animeP()
    anime.remove(el)
    anime({ targets: el, ...params })
  }

  useEffect(() => { play() }, [params]) // 値が変わるたびに試再生

  const copyTs = async () => {
    const def = MOTION_PRESETS[key]
    const code = `{
  key: '${def?.key ?? key}',
  name: '${def?.name ?? key}',
  build: (t) => (${JSON.stringify(def?.build(0.5) ?? {}, null, 2)}),
  defaults: ${JSON.stringify(def?.defaults ?? {}, null, 2)}
}`
    await navigator.clipboard.writeText(code)
    alert('Preset snippet copied!')
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr_380px]">
      {/* 左：リスト */}
      <aside className="rounded-2xl border bg-white p-4">
        <div className="mb-2 text-sm font-medium">Presets</div>
        <div className="space-y-2">
          {Object.keys(MOTION_PRESETS).map(k => (
            <button
              key={k}
              onClick={() => setKey(k)}
              className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${k===key?'bg-black/5':''}`}
            >
              {MOTION_PRESETS[k].name}
            </button>
          ))}
        </div>
      </aside>

      {/* 中央：エディタ */}
      <main className="rounded-2xl border bg-white p-4">
        <div className="mb-4 text-sm font-medium">Editor</div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500">preset</label>
            <select className="w-full" value={key} onChange={(e)=>setKey(e.target.value)}>
              {Object.keys(MOTION_PRESETS).map(k => <option key={k} value={k}>{MOTION_PRESETS[k].name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500">strength</label>
            <input type="range" min={0} max={100} value={strength} onChange={(e)=>setStrength(+e.target.value)} className="w-full"/>
            <div className="mt-1 text-right text-xs text-gray-500">{strength}</div>
          </div>

          <div>
            <label className="block text-xs text-gray-500">duration (override)</label>
            <input className="w-full" type="number" value={duration} onChange={(e)=>setDuration(e.target.value===''? '' : +e.target.value)}/>
          </div>
          <div>
            <label className="block text-xs text-gray-500">easing (override)</label>
            <input className="w-full" placeholder="easeOutCubic / cubicBezier(...)" value={easing} onChange={(e)=>setEasing(e.target.value)}/>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={play} className="rounded-md border px-3 py-2 text-sm">Play</button>
          <a href={`/dev/actions`} className="rounded-md border px-3 py-2 text-sm">Back to /dev/actions</a>
          <button onClick={copyTs} className="rounded-md border px-3 py-2 text-sm">Copy snippet</button>
        </div>
      </main>

      {/* 右：プレビュー */}
      <aside className="rounded-2xl border bg-white p-4">
        <div className="mb-2 text-sm font-medium">Preview</div>
        <div ref={previewRef} className="grid h-48 place-items-center rounded-xl border bg-gradient-to-br from-gray-50 to-gray-100 text-sm">
          Preview box
        </div>
        <div className="mt-2 text-xs text-gray-500">
          値を変えると自動再生します。Play で再生し直し。
        </div>
      </aside>
    </div>
  )
}
