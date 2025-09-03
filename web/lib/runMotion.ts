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

const resolveTarget = (target: NodeTarget | undefined, fallback: HTMLElement | null) => {
  try {
    if (!target) return fallback
    if (target.type === 'css') return document.querySelector(target.value) as HTMLElement | null
    if (target.type === 'nodeId') return document.querySelector<HTMLElement>(`[data-node-id="${target.value}"]`)
    return fallback
  } catch {
    return fallback
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

        // ① 強度→プリセット（優先）
        const fromStrength = buildAnimeParamsFromStrength(eff.preset as string, eff.strength)
        // ② 旧プリセット（従来の Record ）
        const fromLegacy = animePresets[eff.preset as any]?.(el)
        // ③ 個別オプション（最優先）
        const opts = eff.options ?? {}

        const params = { ...base, ...(fromLegacy || {}), ...(fromStrength || {}), ...opts }
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
