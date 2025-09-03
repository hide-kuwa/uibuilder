'use client'
import type { AnimeParams } from 'animejs'
import type { MotionEffect, MotionEvent, NodeTarget } from '@/types/motion'
import { animePresets } from '@/lib/anime-presets'
import { buildAnimeParamsFromStrength } from '@/lib/motion-presets'

declare global {
  interface Window {
    __TD_DISABLE_MOTION__?: boolean
  }
}

let _anime: any | null = null
async function getAnime() {
  if (_anime) return _anime
  // ESMを動的に読み込んでSSRとバンドルの相性問題を回避
  _anime = (await import('animejs/lib/anime.es.js')).default
  return _anime
}

const disabledByQuery = () =>
  typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('nomotion') === '1'

const resolveTarget = (t: NodeTarget | undefined, fb: HTMLElement | null) => {
  try {
    if (!t) return fb
    if (t.type === 'css') return document.querySelector(t.value) as HTMLElement | null
    return document.querySelector<HTMLElement>(`[data-node-id="${t.value}"]`)
  } catch {
    return fb
  }
}

export async function runMotionEffects(
  effects: MotionEffect[] | undefined,
  when: MotionEvent,
  fallbackEl: HTMLElement | null
) {
  try {
    if (typeof window === 'undefined') return
    if (window.__TD_DISABLE_MOTION__ || disabledByQuery()) return
    if (!effects?.length) return

    const anime = await getAnime()

    for (const eff of effects) {
      try {
        if (!eff.runWhen?.includes(when)) continue
        const el = resolveTarget(eff.target, fallbackEl)
        if (!el) continue

        const base: AnimeParams = { duration: 300, easing: 'easeInOutQuad', autoplay: true }

        // ① 強度プリセット
        const fromStrength = buildAnimeParamsFromStrength(eff.preset, eff.strength)
        // ② 旧来のプリセット（el 依存のものがあれば）
        const fromLegacy = animePresets[eff.preset as any]?.(el)
        // ③ ユーザー上書き
        const opts = eff.options ?? {}

        const params: AnimeParams = {
          ...base,
          ...(fromLegacy || {}),
          ...(fromStrength || {}),
          ...opts,
        }

        // --- Path対応（followPath 用） ---
        const sel: string | undefined = (opts as any).pathSelector
        if (sel) {
          const path = anime.path(sel)
          const tx = (params as any).translateX
          const ty = (params as any).translateY
          if (tx === 'path:x' || tx == null) (params as any).translateX = path('x')
          if (ty === 'path:y' || ty == null) (params as any).translateY = path('y')
          if ((opts as any).followAngle) (params as any).rotate = path('angle')
        }

        anime.remove(el)
        anime({ targets: el, ...params })
      } catch (e) {
        // 個別の効果でコケても他に影響しないように
        console.error('[runMotionEffects:item]', e)
      }
    }
  } catch (e) {
    console.error('[runMotionEffects]', e)
  }
}
