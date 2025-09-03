'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { MOTION_PRESETS, buildAnimeParamsFromStrength } from '@/lib/motion-presets'
import type { AnimeParams } from 'animejs'
import { runMotionEffects } from '@/lib/runMotion'
import type { MotionEffect } from '@/types/motion'

export default function MotionLabPage() {
  const url = typeof window !== 'undefined' ? new URL(window.location.href) : new URL('http://localhost')
  const initKey = url.searchParams.get('p') || 'fadeIn'
  const initStrength = Number(url.searchParams.get('s') || 50)

  const [key, setKey] = useState<string>(initKey)
  const [strength, setStrength] = useState<number>(initStrength)
  // 上書き（任意）
  const [duration, setDuration] = useState<number | ''>('')
  const [easing, setEasing] = useState<string>('')

  // ★ 追加：パス追従用オプション
  const [pathSelector, setPathSelector] = useState<string>('#route')
  const [followAngle, setFollowAngle] = useState<boolean>(true)
  // ★（任意）カード束アニメ用：子要素セレクタ
  const [nestedTargetsSelector, setNestedTargetsSelector] = useState<string>('.card')

  const previewRef = useRef<HTMLDivElement | null>(null)
  const dotRef = useRef<HTMLDivElement | null>(null)

  const params: AnimeParams = useMemo(() => {
    const base = buildAnimeParamsFromStrength(key, strength) || {}
    const over: AnimeParams = {}
    if (duration !== '') over.duration = duration
    if (easing) over.easing = easing
    // path/followAngle は runMotion 側で解釈するため、options として渡す
    ;(over as any).pathSelector = pathSelector || undefined
    ;(over as any).followAngle = followAngle || undefined
    ;(over as any).nestedTargetsSelector = nestedTargetsSelector || undefined
    return { ...base, ...over }
  }, [key, strength, duration, easing, pathSelector, followAngle, nestedTargetsSelector])

  const play = async () => {
    const isFollow = key === 'followPath' || !!pathSelector
    const fb = isFollow ? (dotRef.current as HTMLElement | null) : (previewRef.current as HTMLElement | null)

    // runMotionEffects を使って実行（Path・ネストターゲットなどの解釈込み）
    const eff: MotionEffect = {
      id: 'demo',
      preset: key,
      runWhen: ['click'],
      strength,
      target: isFollow ? { type: 'css', value: '#motion-dot' } : undefined,
      // params に入れたオーバーライドを options として渡す
      options: params as any,
    }
    await runMotionEffects([eff], 'click', fb)
  }

  // 値が変わる度に自動再生
  useEffect(() => { play() }, [params])

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr_380px]">
      {/* 左：プリセット一覧 */}
      <aside className="rounded-2xl border bg-white p-4">
        <div className="mb-2 text-sm font-medium">Presets</div>
        <div className="space-y-2">
          {Object.keys(MOTION_PRESETS).map(k => (
            <button
              key={k}
              onClick={() => setKey(k)}
              className={`block w-full rounded-md border px-3 py-2 text-left text-sm ${k === key ? 'bg-black/5' : ''}`}
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
            <select className="w-full" value={key} onChange={(e) => setKey(e.target.value)}>
              {Object.keys(MOTION_PRESETS).map(k => <option key={k} value={k}>{MOTION_PRESETS[k].name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500">strength</label>
            <input type="range" min={0} max={100} value={strength} onChange={(e) => setStrength(+e.target.value)} className="w-full" />
            <div className="mt-1 text-right text-xs text-gray-500">{strength}</div>
          </div>

          <div>
            <label className="block text-xs text-gray-500">duration (override)</label>
            <input className="w-full" type="number" value={duration} onChange={(e) => setDuration(e.target.value === '' ? '' : +e.target.value)} />
          </div>
          <div>
            <label className="block text-xs text-gray-500">easing (override)</label>
            <input className="w-full" placeholder="easeOutCubic / cubicBezier(...)" value={easing} onChange={(e) => setEasing(e.target.value)} />
          </div>

          {/* ★ 追加：パス追従オプション */}
          <div>
            <label className="block text-xs text-gray-500">pathSelector (for Follow path)</label>
            <input className="w-full" placeholder="#route" value={pathSelector} onChange={(e) => setPathSelector(e.target.value)} />
          </div>
          <label className="mt-6 inline-flex items-center gap-2 text-xs text-gray-600">
            <input type="checkbox" checked={followAngle} onChange={(e) => setFollowAngle(e.target.checked)} />
            followAngle（進行方向に回転）
          </label>

          {/* （任意）子ターゲットをまとめて動かすセレクタ */}
          <div className="col-span-2">
            <label className="block text-xs text-gray-500">nestedTargetsSelector (e.g. .card)</label>
            <input className="w-full" placeholder=".card" value={nestedTargetsSelector} onChange={(e) => setNestedTargetsSelector(e.target.value)} />
            <p className="mt-1 text-xs text-gray-500">カード束アニメなど、コンテナ配下の要素をまとめて動かす時に使います。</p>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button onClick={play} className="rounded-md border px-3 py-2 text-sm">Play</button>
          <a href={`/dev/actions`} className="rounded-md border px-3 py-2 text-sm">Back to /dev/actions</a>
        </div>
      </main>

      {/* 右：プレビュー */}
      <aside className="rounded-2xl border bg-white p-4">
        <div className="mb-2 text-sm font-medium">Preview</div>

        {/* パス（見えるように灰線で描画） */}
        <svg width="100%" height="120" viewBox="0 0 360 120" className="mb-2">
          <path id="route" d="M10,100 C120,10 220,190 350,60" fill="none" stroke="#e5e7eb" strokeWidth="2" />
        </svg>

        {/* コンテナ：カード束 & ドット */}
        <div ref={previewRef} className="relative grid gap-2 rounded-xl border bg-gradient-to-br from-gray-50 to-gray-100 p-4">
          {/* dot（パス移動のターゲット） */}
          <div id="motion-dot" ref={dotRef} className="absolute left-0 top-0 h-4 w-4 -translate-x-2 -translate-y-2 rounded-full bg-indigo-500" />

          {/* カード束（cardShuffle 用） */}
          <div className="relative grid grid-cols-3 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card h-16 rounded-lg border bg-white shadow-sm" />
            ))}
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          Follow path は #route に沿って #motion-dot が移動します。Card Shuffle は .card を対象に動きます。
        </div>
      </aside>
    </div>
  )
}
